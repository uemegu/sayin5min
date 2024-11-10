import CryptoJS from "crypto-js";
import { SavedItem } from "../Store";

const secretKey = "uemgu_l*'jei4fzkNZ";

export const saveData = (data: SavedItem) => {
  let savedData = loadData();
  savedData.push(data);
  const jsonString = JSON.stringify(savedData);
  const encryptedData = CryptoJS.AES.encrypt(jsonString, secretKey).toString();
  localStorage.setItem("savedData", encryptedData);
};

export const loadData = (): Array<SavedItem> => {
  const encryptedData = localStorage.getItem("savedData");
  if (!encryptedData) return [];

  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

  try {
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("データの復号化に失敗しました:", error);
    return [];
  }
};
