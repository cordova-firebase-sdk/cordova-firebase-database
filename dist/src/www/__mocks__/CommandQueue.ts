export const execCmd = jest.fn((params: any): Promise<any> => {
  return Promise.resolve(params);
});
