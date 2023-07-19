// Dependency import
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";

// Env configuration + initializing express app
dotenv.config();
const app = express();

// Custom request interface extending the default Request interface
interface CustomRequest extends Request {
  readtable?: any;
}

// Airtable fetch middleware
const fetch = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const auth = `Bearer ${process.env.ACCESS_TOKEN}`;
  const baseId = process.env.BASE_ID;
  const tableId = process.env.TABLE_ID;
  const endpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`;
  const resp = await axios.get(endpoint, {
    headers: {
      Authorization: auth,
    },
  });
  req.readtable = resp.data.records;
  next();
};

// Sorting out entries based on current month
const montharray = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  var currentarr = [] as string[];
  for (let i = 0; i < req.readtable.length; i++) {
    const dateString = req.readtable[i]["fields"].Date;
    const regex = /^(\d{4})-(\d{2})-\d{2}$/;
    const match = regex.exec(dateString);
    const month = match ? parseInt(match[2], 10) : null;
    if (month === currentMonth) {
      currentarr.push(req.readtable[i]["fields"]);
    }
  }
  res.send(JSON.stringify({ Current_Month_Entries: currentarr }));
};

// Root endpoint
app.get("/", (request: Request, response: Response) => {
  response.send(
    "hello polgyon <3, fetch your entries for this month <a href='/fetch'>here</a>"
  );
});

// Fetch endpoint
app.get("/fetch", fetch, montharray);

// Runing the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
