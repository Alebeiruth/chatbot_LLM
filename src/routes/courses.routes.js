import express from "express";
import { responderCursosPorTexto } from "../controllers/courses.controller.js";

const router = express.Router();

router.get("/consultar-por-texto", responderCursosPorTexto);

export default router ;
