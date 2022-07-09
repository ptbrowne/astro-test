import React, { PureComponent, useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchData } from "../data";
import lodash from "lodash";

const { sortBy, groupBy, mapValues } = lodash;

const usePromise = <T extends unknown>(promiser: () => Promise<T>) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    promiser().then((data) => {
      setData(data);
    });
  }, []);
  return data;
};

export default ({ operatorIds, data }) => {
  console.log("data", { data });
  const names = {};
  const pivotted = useMemo(() => {
    const sorted = sortBy(data, (x) => parseInt(x.d_period, 10));
    const byPeriod = groupBy(sorted, (x) => x.d_period);
    return Object.entries(byPeriod).map(([period, rows]: [string, any[]]) => {
      const res = { period };
      for (let row of rows) {
        names[row.d_operator] = row.d_operator_name;
        res[row.d_operator] = row.d_total;
      }
      return res;
    });
  });

  return data ? (
    <div style={{ height: 400, width: 800 }}>
      <ResponsiveContainer>
        <LineChart
          width={500}
          height={300}
          data={pivotted}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          {operatorIds.map((operatorId) => (
            <Line
              key={operatorId}
              type="monotone"
              dataKey={`https://energy.ld.admin.ch/elcom/electricityprice/operator/${operatorId}`}
              name={
                names[
                  `https://energy.ld.admin.ch/elcom/electricityprice/operator/${operatorId}`
                ]
              }
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <div>Loading data...</div>
  );
};
