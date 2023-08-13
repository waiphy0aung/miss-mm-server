const urlToPath = url => {
  const baseUrl = "https://firebasestorage.googleapis.com/v0/b/miss-mm-53464.appspot.com/o/";
  let imagePath = url.replace(baseUrl, "");
  const indexOfEndPath = imagePath.indexOf("?");
  imagePath = imagePath.substring(0, indexOfEndPath);
  imagePath = imagePath.replace(/%2F/g, "/");
  imagePath = imagePath.replace(/%20/g, " ");
  return imagePath
}

export default urlToPath
