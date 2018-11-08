export const exec = jest.fn((onSuccess, onError, pluginName, methodName, args): any => {
  setTimeout(onSuccess, 1);
  return {
    args,
    methodName,
    pluginName,
  };
});
