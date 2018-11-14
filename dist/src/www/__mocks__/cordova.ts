export let platformId: string = "browser";

export const setPlatformId = (pId: string): void => {
  platformId = pId;
};

export const exec = jest.fn((onSuccess, onError, pluginName, methodName, args): void => {
  setTimeout(() => {
    onSuccess();
  }, 0);
});
