import React, { useState, useEffect } from 'react';
import { generateAnalysis, generateDemoColumns, generateTaxoColumns } from './GenerateColumns';
import { 
  Skeleton, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  IconButton,
  Button,
  List,
  ListItem, 
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Papa from 'papaparse';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import Filter from './table_components/TableFilter';
import './TanDatatable.css'

function TanDatatable({data_path, next_step}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [field, setField] = useState("");
  const [columnFilters, setColumnFilters] = React.useState([])

  useEffect(() => {
    if (data_path) {
      Papa.parse(data_path, {
        header: true,
        download: true,
        delimiter: ',',
        skipEmptyLines: true,
        complete: (result) => {
          let clean_data = cleanData(result.data);
          //console.log(Object.keys(clean_data[0]));
          setData(clean_data);
          //setCurrentData(clean_data);
          //setFilteredData(clean_data);
          setLoading(false);
        },
      });
    }  
  }, [])


  const cleanData = (input) => {
    let result = [];
    input.forEach((element) => {
      let current_row = {};
      for (var key in element) {
        if (checkNumber(element[key])){
          current_row[key] = parseFloat(element[key]);
        } else {
          current_row[key] = element[key];
        }
      }
      result.push(current_row)
    })
    return result;
  }
  const checkNumber = (input) => {
    let isnum = /^\d+(\.\d+)?$/.test(input);
    return isnum;
  }

  const handleSelectChange = (e) => {
    setField(e.target.value);
  }

  const getAllSelectedIDs = () => {
    return Array.from(table.getColumn('AMD ID').getFacetedUniqueValues(), (entry) => entry[0])
  }


  // table logic
  const columnHelper = createColumnHelper();

  const defaultCols = [
    columnHelper.accessor( 'AMD ID', {
      cell: info => info.getValue(),
      footer: "Mean value: ",
      filterFn: 'includesString'
    }),
    
    columnHelper.group({
      header: 'Demographic info',
      footer: props => props.column.id,
      columns: generateDemoColumns(columnHelper)
    }),

    columnHelper.group({
      header: 'Taxonomic info',
      footer: props => props.column.id,
      columns: generateTaxoColumns(columnHelper)
    }),

    columnHelper.group({
      header: 'Analysis',
      footer: props => props.column.id,
      columns: generateAnalysis(columnHelper)
    })
  ]

  const tableData = React.useMemo(
    () => (loading ? Array(30).fill({}) : data),
    [loading, data]
  ); 

  const tableColumns = React.useMemo(
    () =>
      loading
        ? defaultCols.map((column) => ({
            ...column,
            cell: () => <Skeleton />,
          }))
        : defaultCols,
    [loading, defaultCols]
  );


  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    enableFilters: true,
    enableColumnFilters: true,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel:getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    initialState: {
      pagination: {
          pageSize: 15,
      }
    },
    state: {
      columnFilters
    }
  })

  return(
    <div>
      <h1>Landing page</h1>
      <div className='filterBox'>
        <div className='filterSelect'>
        <FormControl variant='standard' sx={{width: 150}}>
          <InputLabel>Filter by:</InputLabel>
          <Select value={field} onChange={handleSelectChange}>
            {table.getAllLeafColumns().map((column, index) => {
              return (
                <MenuItem value={column.id} key={index}>
                  {column.id}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {field == "" ? null : <Filter column={table.getColumn(field)} table={table} />}
        </div>
        <Button variant='outlined' endIcon={<ArrowForwardIcon />} onClick={() => next_step(getAllSelectedIDs())}>Next</Button>
      </div>
      <div className='filterDisplay'>
        <List sx={{display:'flex', flexDirection:'row'}}>
          {columnFilters.map((filter) => {
            return (
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={ () => table.getColumn(filter.id).setFilterValue("") }>
                    <CloseIcon />
                  </IconButton>
                }
                sx={{width:200}}
                key={filter.id}
              >
                <ListItemText 
                primary={filter.id}
                secondary={typeof filter.value === 'object' ? filter.value[0] + " - " + filter.value[1] : filter.value}
                />
              </ListItem>
            )
          })}
        </List>
      </div>
      <div className='table-display'>
        <table>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} colSpan={header.colSpan} style={{width:header.getSize()}}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{width:cell.column.getSize()}}> 
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr key='footer_row'>
            {table.getFooterGroups()[0].headers.map(header => (
                <th key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
              </th>
              )
            )}
            </tr>
          </tfoot>
        </table>
        </div>
    <div>
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <span>
          Showing entries{' '}
          <strong>
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} {" - "} 
          {table.getState().pagination.pageIndex == (table.getPageCount() - 1) ? table.getFilteredRowModel().rows.length : (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize}
          </strong>
          {" of "}
          {table.getFilteredRowModel().rows.length}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
      </div>
  </div>
  )
}

export default TanDatatable;