export function isValidTodoTitle(title) {
  const trimmedTitle = title.trim();

  return trimmedTitle !== "" && trimmedTitle.length <= 100;
}