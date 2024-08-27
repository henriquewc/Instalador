import express from "express";
import isAuth from "../middleware/isAuth";

import * as ContactController from "../controllers/ContactController";
import * as ImportXLSContactsController from "../controllers/ImportXLSContactsController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";
import multer from "multer";
import uploadConfig from "../config/upload";
import apiTokenAuth from "../middleware/apiTokenAuth";
const contactRoutes = express.Router();

contactRoutes.post(
  "/contacts/import",
  isAuth,
  ImportPhoneContactsController.store
);

const upload = multer(uploadConfig);

contactRoutes.get("/contacts", apiTokenAuth, isAuth, ContactController.index);

contactRoutes.get("/contacts/list", apiTokenAuth, isAuth, ContactController.list);

contactRoutes.get("/contacts/:contactId", apiTokenAuth, isAuth, ContactController.show);

contactRoutes.post("/contacts/findOrCreate", isAuth, ContactController.findOrCreate);

contactRoutes.post("/contacts", apiTokenAuth, isAuth, ContactController.store);

contactRoutes.put("/contacts/:contactId", apiTokenAuth, isAuth, ContactController.update);

contactRoutes.delete("/contacts/:contactId", apiTokenAuth, isAuth, ContactController.remove);

contactRoutes.put("/contacts/toggleDisableBot/:contactId", apiTokenAuth, isAuth, ContactController.toggleDisableBot);

contactRoutes.delete("/contacts", isAuth, ContactController.removeAll);

contactRoutes.post("/contacts/upload", isAuth, upload.array("file"), ContactController.uploadContacts);

export default contactRoutes;
