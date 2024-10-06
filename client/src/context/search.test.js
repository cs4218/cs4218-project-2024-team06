import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchProvider, useSearch } from "./search"; // Adjust the import path accordingly
import '@testing-library/jest-dom';

const TestComponent = () => {
  const [searchValues, setSearchValues] = useSearch();

  const handleChange = () => {
    setSearchValues({ ...searchValues, keyword: "new keyword" });
  };

  return (
    <div>
      <p data-testid="keyword">{searchValues.keyword}</p>
      <button onClick={handleChange}>Change Keyword</button>
    </div>
  );
};

describe("SearchProvider", () => {
  test("should provide initial context values", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    const keywordElement = screen.getByTestId("keyword");
    expect(keywordElement).toHaveTextContent("");
  });

  test("should update context values", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    const button = screen.getByRole("button", { name: /change keyword/i });
    fireEvent.click(button); 

    const keywordElement = screen.getByTestId("keyword");
    expect(keywordElement).toHaveTextContent("new keyword"); 
  });
});
