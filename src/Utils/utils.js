import * as fs from "fs";

export const CreateFolderIfNotExists = name => {
  name = `./Downloads/${name}`;
  if (!fs.existsSync(name)) {
    fs.mkdir(name, { recursive: true }, (err) => {
        if (err) throw err;
      });
    return true;
  } else 
  return false;
};
