import { debounce } from "lodash-es";
import { useState, useEffect, useMemo } from "react";
import { SEARCH_DELAY } from "../utils";

const useDebouncedSearch = (initialValue: string) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  // Memoize the debounced function so it's not recreated on every render
  const debouncedFunction = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedValue(value);
      }, SEARCH_DELAY),
    []
  );

  useEffect(() => {
    // Call the debounced function with the current search value
    debouncedFunction(searchValue);

    // Cancel the debounced function call if the component unmounts or searchValue changes
    return () => {
      debouncedFunction.cancel();
    };
  }, [searchValue, debouncedFunction]);

  return { searchValue, setSearchValue, debouncedValue };
};

export default useDebouncedSearch;
