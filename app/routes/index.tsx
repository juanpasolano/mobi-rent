import Input from "@components/input";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useParams } from "react-router";

const numFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const f = numFormat.format;

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

type TBaseData = {
  fullCostAvr: number;
  downCoefficient: number;
  interestRate: number;
  yearsLoan: number;
  rent: number;
};
type LoaderData = TBaseData & ReturnType<typeof getOperations>;

const round = (n: number) => Math.round(n * 100) / 100;

const getOperations = (data: TBaseData) => {
  const fullCost = data.fullCostAvr * 1000000;
  const initialDownPayment = fullCost * data.downCoefficient;
  const loanAmount = fullCost * (1 - data.downCoefficient);

  const interest1200 = data.interestRate / 1200;
  const monthlyPay =
    (interest1200 +
      interest1200 / ((1 + interest1200) ** (data.yearsLoan * 12) - 1)) *
    loanAmount;

  const anualYield = (data.rent * 100) / fullCost;
  return {
    fullCost,
    initialDownPayment,
    loanAmount,
    monthlyPay,
    anualYield,
  };
};
export const loader: LoaderFunction = ({ request }) => {
  const params = queryString.parse(new URL(request.url).search);
  const data = {
    fullCostAvr: Number(params.fullCostAvr) || 130,
    downCoefficient: Number(params.downCoefficient) || 0.3,
    interestRate: Number(params.interestRate) || 11,
    yearsLoan: Number(params.yearsLoan) || 20,
    rent: Number(params.rent) || 770000,
  };

  return {
    ...data,
    ...getOperations(data),
  };
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Rentabilidad: ${round(data.anualYield)}`,
    description: `Costo total: ${f(data.fullCost)}\nCuota: ${f(
      data.monthlyPay
    )}\nCuota - renta: ${f(data.monthlyPay - data.rent)}`,
  };
};

export default function Index() {
  const data = useLoaderData<LoaderData>();
  const [fullCostAvr, setFullCostAvr] = useState(data.fullCostAvr);
  const [downCoefficient, setDownCoefficient] = useState(data.downCoefficient);
  const [interestRate, setInterestRate] = useState(data.interestRate);
  const [yearsLoan, setYearsLoad] = useState(data.yearsLoan);
  const [rent, setRent] = useState(data.rent);

  const [domain, setDomain] = useState("");

  const fullCost = fullCostAvr * 1000000;
  const initialDownPayment = fullCost * downCoefficient;
  const loanAmount = fullCost * (1 - downCoefficient);

  const interest1200 = interestRate / 1200;
  const monthlyPay =
    (interest1200 +
      interest1200 / ((1 + interest1200) ** (yearsLoan * 12) - 1)) *
    loanAmount;

  const anualYield = (rent * 100) / fullCost;

  const qs = {
    fullCostAvr,
    downCoefficient,
    interestRate,
    yearsLoan,
    rent,
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  return (
    <div className="flex">
      {/* Left Col */}
      <div className="h-screen w-56 p-2 bg-primary">
        <div className="space-y-2">
          <Input
            id="fullCost"
            label="Costo (M)"
            value={fullCostAvr}
            type="text"
            onChange={(e: ChangeEvent) =>
              setFullCostAvr(Number(e.target.value))
            }
          />
          <Input
            id="rent"
            label="Arriendo Estimado"
            value={rent}
            type="text"
            onChange={(e: ChangeEvent) => setRent(Number(e.target.value))}
          />
          <Input
            id="downCoefficient"
            label={`Cuota Inicial ${downCoefficient * 100}%`}
            type="range"
            name="downCoefficient"
            value={downCoefficient}
            onChange={(e: ChangeEvent) =>
              setDownCoefficient(Number(e.target.value))
            }
            step={0.05}
            min={0.3}
            max={0.6}
          />
          <Input
            label={`Interés E.A. ${interestRate}%`}
            type="range"
            name="interestRate"
            id="interestRate"
            value={interestRate}
            onChange={(e: ChangeEvent) =>
              setInterestRate(Number(e.target.value))
            }
            step={0.5}
            min={5}
            max={20}
          />
          <Input
            label={`Anos ${yearsLoan}`}
            type="range"
            name="yearsLoan"
            id="yearsLoan"
            value={yearsLoan}
            onChange={(e: ChangeEvent) => setYearsLoad(Number(e.target.value))}
            step={1}
            min={5}
            max={20}
          />
        </div>

        <div className="mt-4">
          <CopyToClipboard text={`${domain}?${queryString.stringify(qs)}`}>
            <span className="btn btn-sm">Copiar link</span>
          </CopyToClipboard>
        </div>
      </div>

      {/* Right Col */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <tbody>
              <tr>
                <td>Costo</td>
                <td className="font-mono ">{f(fullCost)}</td>
              </tr>
              <tr>
                <td>Cuota inicial {downCoefficient * 100}%</td>
                <td className="font-mono ">{f(initialDownPayment)}</td>
              </tr>
              <tr>
                <td>Prestamo Banco</td>
                <td className="font-mono ">{f(loanAmount)}</td>
              </tr>
              <tr>
                <td>Cuota Mensual</td>
                <td className="font-mono ">{f(monthlyPay)}</td>
              </tr>
              <tr>
                <td>Cuota Mensual - Arriendo</td>
                <td className="font-mono ">{f(monthlyPay - rent)}</td>
              </tr>
              <tr>
                <td>Rentabilidad anual</td>
                <td className="font-mono">{round(anualYield)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
