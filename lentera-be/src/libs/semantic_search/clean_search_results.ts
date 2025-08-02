/**
 * Removes duplicate search results based on title and bookTitle
 * @param data Array of search results
 * @returns Array of unique search results
 */
export async function removeDuplicates(data: any[]) {
  const seen = new Set();
  const uniqueData = [];

  for (const item of data) {
    const key = `${item.title} | ${item.bookTitle}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueData.push(item);
    }
  }

  return uniqueData;
}

/**
 * Filters out search results with empty descriptions
 * @param data Array of search results
 * @returns Array of search results with valid descriptions
 */
export async function filterEmptyDescriptions(data: any[]) {
  return data.filter(item => item.description !== "...");
}

/**
 * Cleans search results by removing duplicates and filtering out empty descriptions
 * @param data Array of search results
 * @returns Cleaned array of search results
 */
export async function cleanSearchResults(data: any[]) {
  // First remove duplicates
  const uniqueData = await removeDuplicates(data);
  
  // Then filter out empty descriptions
  return filterEmptyDescriptions(uniqueData);
}