import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import * as ApiController from "../controllers/ApiController";
import tokenAuth from "../middleware/tokenAuth";
import apiTokenAuth from "../middleware/apiTokenAuth";
import isAuth from "../middleware/isAuth";
const upload = multer(uploadConfig);
const ApiRoutes = express.Router();

// rotas para enviar menssagens //
ApiRoutes.post("/api/messages/send", tokenAuth, upload.array("medias"), ApiController.index);
ApiRoutes.post("/api/messages/send/linkPdf", tokenAuth, ApiController.indexLink);
ApiRoutes.post("/api/messages/send/linkImage", tokenAuth, ApiController.indexImage);
ApiRoutes.post("/api/messages/checkNumber", tokenAuth, ApiController.checkNumber);
ApiRoutes.post("/api/messages/send/linkAudio", tokenAuth, ApiController.handleAudioLink);

// rotas para manipular tickets //
// trocar fila //
ApiRoutes.post("/api/ticket/QueueUpdate/:ticketId", tokenAuth, ApiController.updateQueueId);
//encerrarticket
ApiRoutes.post("/api/ticket/close/:ticketId", tokenAuth, ApiController.closeTicket);

// adicionar e remover tags //
ApiRoutes.post("/api/ticket/TagUpdate", tokenAuth, ApiController.updateTicketTag);
ApiRoutes.delete("/api/ticket/TagRemove", tokenAuth, ApiController.removeTicketTag);
// listar tickets //
ApiRoutes.get("/api/ticket/ListTickets", tokenAuth, ApiController.listTicketsByCompany);
ApiRoutes.get("/api/ticket/ListByTag/:tagId", tokenAuth, ApiController.listTicketsByTag);

//invoices
ApiRoutes.get("/api/invoices", tokenAuth, ApiController.indexApi);
ApiRoutes.get("/api/invoices/:Invoiceid", tokenAuth, ApiController.showApi);
ApiRoutes.post("/api/invoices/listByCompany", tokenAuth, ApiController.showAllApi);
ApiRoutes.put("/api/invoices/:id", tokenAuth, ApiController.updateApi);

//contacts
ApiRoutes.get("/api/contacts", apiTokenAuth, isAuth, ApiController.indexContacts);
ApiRoutes.get("/api/contacts/list", apiTokenAuth, isAuth, ApiController.listContacts);
ApiRoutes.get("/api/contacts/:contactId", apiTokenAuth, isAuth, ApiController.showContacts);
ApiRoutes.post("/api/contacts/findOrCreate", isAuth, ApiController.findOrCreateContacts);
ApiRoutes.post("/api/contacts", apiTokenAuth, isAuth, ApiController.storeContacts);
ApiRoutes.put("/api/contacts/:contactId", apiTokenAuth, isAuth, ApiController.updateContacts);
ApiRoutes.delete("/api/contacts/:contactId", apiTokenAuth, isAuth, ApiController.removeContacts);
ApiRoutes.put("/api/contacts/toggleDisableBot/:contactId", apiTokenAuth, isAuth, ApiController.toggleDisableBotContacts);
ApiRoutes.delete("/api/contacts", isAuth, ApiController.removeAllContacts);
ApiRoutes.post("/api/contacts/upload", isAuth, upload.array("file"), ApiController.uploadContacts);

// company
ApiRoutes.post("/api/company/edit/:id", apiTokenAuth, isAuth, ApiController.updateCompany);
ApiRoutes.post("/api/company/new", apiTokenAuth, isAuth, ApiController.createCompany);
ApiRoutes.post("/api/company/block", apiTokenAuth, isAuth, ApiController.blockCompany);

export default ApiRoutes;
