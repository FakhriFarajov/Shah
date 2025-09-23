import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export type AdaptiveTableColumn<T> = {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
};

export interface AdaptiveTableProps<T> {
  columns: AdaptiveTableColumn<T>[];
  data: T[];
}

export function AdaptiveTable<T extends { [key: string]: any }>({ columns, data }: AdaptiveTableProps<T>) {
  return (
    <div className="overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col.key)}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
