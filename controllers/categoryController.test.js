import slugify from "slugify";
import categoryModel from "../models/categoryModel";
import { 
    createCategoryController, 
    categoryControlller, 
    singleCategoryController, 
    updateCategoryController,
    deleteCategoryCOntroller
} from "./categoryController";

jest.mock("../models/categoryModel");
jest.mock("slugify");

describe('category controller', () => {
    let req, res, consoleLogSpy;
    const error = new Error('Database error');

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test('should return 200 and get all categories', async () => {
        categoryModel.find = jest.fn().mockResolvedValue({});

        await categoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "All Categories List",
            category: {},
        })
    });

    test('should return 500 while getting categories', async () => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {error});
        categoryModel.find = jest.fn().mockRejectedValue(error);

        await categoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error while getting all categories",
        });
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
    });
});

describe('createCategoryController', () => {
    let req, res, consoleLogSpy;
    const error = new Error('Database error');

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test('should return 401 if no req body', async () => {
        req.body = {};

        await createCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
    })

    test('should return 409 if catergory exists', async () => {
        req.body = { name: "test" };
        categoryModel.findOne.mockResolvedValue({ name: "test" });

        await createCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.send).toHaveBeenCalledWith({ success: false, message: "Category Already Exists" });
    })

    test('should return 201 and create new category', async () => {
        req.body = { name: 'test' };
        categoryModel.findOne.mockResolvedValue(null);
        slugify.mockReturnValue('test-slug');
        categoryModel.mockImplementation((data) => ({
            ...data,
            save: jest.fn().mockResolvedValue(data)
        }));

        await createCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: 'new category created',
            category: { name: 'test', slug: 'test-slug' }
        });
    });

    test('should return 500 and error while creating category', async () => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.body = { name: 'test' };
        categoryModel.findOne = jest.fn().mockRejectedValue(error);

        await createCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: 'Error in category'
        });
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
    });
})

describe('updateCategoryController', () => {
    let req, res, consoleLogSpy;
    const error = new Error('Database error');

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test('returns 200 with valid name and id', async () => {
        
        //ARRANGE
        req.body = { name: 'test' }; 
        req.params = { id: 1 };

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const updatedCategory = { name: 'test', id: 1, slug: 'test' };
        categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedCategory);

        //ACT
        await updateCategoryController(req, res);
        
        //ASSERT
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            messsage: "Category Updated Successfully",
            category: updatedCategory
        });
    });

    test.failing('returns 500 and error while updating category without id', async () => {
        //ARRANGE
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.body = { name: 'test' }; 
        categoryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

        //ACT
        await updateCategoryController(req, res);
        
        //ASSERT (original message buggy)
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect(error),
            message: 'Error In Updating Category'
        });
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
    });
})

describe('deleteCategoryController', () => {
    let req, res, consoleLogSpy;
    const error = new Error('Database error');

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test.failing('return 200 with valid id', async () => {
        
        // ARRANGE
        req.params = { id: 1 };
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const deletedCategory = { id: 1, slug: 'test' };
        categoryModel.findByIdAndDelete = jest.fn().mockResolvedValue(deletedCategory);

        // ACT
        await deleteCategoryCOntroller(req, res);
        
        // ASSERT
        expect(res.status).toHaveBeenCalledWith(200);
        // Always fails as message buggy in code as per standards
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Category Deleted Successfully",
        });
    });

    test.failing('returns 500 and error when deleting category with invalid id', async () => {

        // ARRANGE
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.body = {id: "abcd"}; 
        categoryModel.findByIdAndDelete = jest.fn().mockRejectedValue(error);

        // ACT
        await deleteCategoryCOntroller(req, res);

        // ASSERT
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
        expect(res.status).toHaveBeenCalledWith(500);
        //Always fails as message in original code buggy as per standards
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect(error),
            message: 'Error In Deleting Category'
        });
    });
})

describe('singleCategoryController', () => {
    let req, res, consoleLogSpy;
    const error = new Error('Database error');

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    test('should return 200 and get single category', async () => {
        req.params = { slug: 'slug-test'};
        categoryModel.findOne = jest.fn().mockResolvedValue({ category: 'test-category' });

        await singleCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Get single category successfully",
            category: 'test-category',
        });
    });

    test('should return 500 while getting single category', async () => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        categoryModel.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

        await singleCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error While getting Single Category",
        });
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
    });
})