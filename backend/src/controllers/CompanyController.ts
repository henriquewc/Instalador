import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import Company from "../models/Company";
import jwtConfig from "../config/auth";
import ListCompaniesService from "../services/CompanyService/ListCompaniesService";
import CreateCompanyService from "../services/CompanyService/CreateCompanyService";
import UpdateCompanyService from "../services/CompanyService/UpdateCompanyService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import UpdateSchedulesService from "../services/CompanyService/UpdateSchedulesService";
import DeleteCompanyService from "../services/CompanyService/DeleteCompanyService";
import FindAllCompaniesService from "../services/CompanyService/FindAllCompaniesService";
import { verify } from "jsonwebtoken";
import User from "../models/User";
import ShowPlanCompanyService from "../services/CompanyService/ShowPlanCompanyService";
import ListCompaniesPlanService from "../services/CompanyService/ListCompaniesPlanService";
import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import ListSettingsService from "../services/SettingServices/ListSettingsService";
import ListSettingsServiceOne from "../services/SettingServices/ListSettingsServiceOne";
import CheckSettings from "../helpers/CheckSettings";
import moment from "moment";
import fs from "fs";
import path from "path";

const publicFolder = path.resolve(__dirname, "..", "..", "public");

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

type CompanyData = {
  name: string;
  id?: number;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: any;
  recurrence?: string;
};

type SchedulesData = {
  schedules: [];
};

interface SettingsRequest {
  isSuper: boolean,
  companyId: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { companies, count, hasMore } = await ListCompaniesService({
    searchParam,
    pageNumber
  });

  return res.json({ companies, count, hasMore });
};

export const signup = async (req: Request, res: Response): Promise<Response> => {
  if (await CheckSettings("allowSignup") !== "enabled") {
    return res.status(401).json("🙎🏻‍♂️ Signup disabled");
  }
  return await store(req, res);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newCompany: CompanyData = req.body;

  try {
    const trialDays = await CheckSettings('trialExpiration');
    const totalDays = parseInt(trialDays, 10);

    if (isNaN(totalDays) || totalDays <= 0) {
      newCompany.dueDate = moment().add(7, 'days').toDate();
    } else {
      newCompany.dueDate = moment().add(totalDays, 'days').toDate();
    }

    const company = await CreateCompanyService(newCompany);
    return res.status(201).json(company);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating company', error });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const requestUser = await User.findByPk(req.user.id);
  if (!requestUser.super && Number.parseInt(id, 10) !== requestUser.companyId) {
    throw new AppError("ERR_FORBIDDEN", 403);
  }

  const company = await ShowCompanyService(id);

  return res.status(200).json(company);
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const companies: Company[] = await FindAllCompaniesService();

  return res.status(200).json(companies);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const companyData: CompanyData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string().email().nullable(),
    phone: Yup.string().nullable(),
    status: Yup.boolean().nullable(),
    planId: Yup.number().nullable(),
    campaignsEnabled: Yup.boolean().nullable(),
    dueDate: Yup.date().nullable(),
    recurrence: Yup.string().nullable()
  });

  try {
    await schema.validate(companyData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { id } = req.params;

  const company = await UpdateCompanyService({ id, ...companyData });

  return res.status(200).json(company);
};

export const updateSchedules = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { schedules }: SchedulesData = req.body;
  const { id } = req.params;

  const requestUser = await User.findByPk(req.user.id);
  if (!requestUser.super && Number.parseInt(id, 10) !== requestUser.companyId) {
    throw new AppError("ERR_FORBIDDEN", 403);
  }

  const company = await UpdateSchedulesService({
    id,
    schedules
  });

  return res.status(200).json(company);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (fs.existsSync(`${publicFolder}/company${id}/`)) {
    fs.rmdirSync(`${publicFolder}/company${id}/`, { recursive: true });
  }
  const company = await DeleteCompanyService(id);

  return res.status(200).json(company);
};

export const listPlan = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const authHeader = req.headers.authorization;
  const [, token] = authHeader.split(" ");
  const decoded = verify(token, jwtConfig.secret);
  const { id: requestUserId, profile, companyId } = decoded as TokenPayload;
  const requestUser = await User.findByPk(requestUserId);

  if (requestUser.super === true || companyId.toString() === id) {
    const company = await ShowPlanCompanyService(id);
    return res.status(200).json(company);
  } else {
    return res.status(400).json({ error: "Você não possui permissão para acessar este recurso!" });
  }
};

export const indexPlan = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const authHeader = req.headers.authorization;
  const [, token] = authHeader.split(" ");
  const decoded = verify(token, jwtConfig.secret);
  const { id, profile, companyId } = decoded as TokenPayload;
  const requestUser = await User.findByPk(id);

  if (requestUser.super === true) {
    const companies = await ListCompaniesPlanService();
    return res.json({ companies });
  } else {
    return res.status(400).json({ error: "Você não possui permissão para acessar este recurso!" });
  }
};
