const useFormatter = () => {
  // Remove trailing zeros from a number string
  const removeTrailingZeros = (numStr) => {
    if (!numStr) return "0";
    return numStr.replace(/\.?0+$/, "");
  };

  // Get the suffix for a number (e.g., "k" for thousands)
  const getSuffix = (numStr) => {
    if (!numStr) return "";
    
    // If the number has a decimal point, return the decimal part
    if (numStr.includes(".")) {
      const parts = numStr.split(".");
      if (parts[1] && parts[1] !== "0" && parts[1] !== "00") {
        return "." + parts[1];
      }
    }
    
    return "";
  };

  return {
    removeTrailingZeros,
    getSuffix
  };
};

export default useFormatter;