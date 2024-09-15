import slugify from "slugify";
import categoryModel from "../models/categoryModel";
import { 
    createCategoryController, 
    updateCategoryController, 
    categoryControlller, 
    singleCategoryController, 
    deleteCategoryCOntroller
} from "./categoryController";

jest.mock("../models/categoryModel");
jest.mock("slugify");

describe('category controller', () => {
    let req, res, consoleLogSpy;

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

    test('should return 200 if catergory exists', async () => {
        req.body = { name: "test" };
        categoryModel.findOne.mockResolvedValue({ name: "test" });

        await createCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ success: true, message: "Category Already Exists" });
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
        categoryModel.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

        await createCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: 'Error in category'
        });
    });

    test('should return 200 and update category', async () => {
        req.body = { name: 'updated' };
        req.params = { id: 1 };
        slugify.mockReturnValue('test-slug');
        categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
            name: 'updated',
            slug: 'test-slug',
        });

        await updateCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            messsage: "Category Updated Successfully",
            category: {
                name: 'updated',
                slug: 'test-slug',
            }
        });
    });

    test('should return 500 while updating category', async () => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.body = { name: 'test' };
        categoryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

        await updateCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error while updating category",
        });
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
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        categoryModel.find = jest.fn().mockRejectedValue(new Error('Database error'));

        await categoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error while getting all categories",
        });
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
    });

    test('should return 200 and delete category', async() => {
        req.params = { id: 1 };
        categoryModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

        await deleteCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Category Deleted Successfully",
        })
    });

    test('should return 500 while deleted category', async () => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        categoryModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

        await deleteCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error While getting Single Category",
        });
    });
});