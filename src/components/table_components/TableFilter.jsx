import React from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

function Filter({
    column,
    table,
    }) {
    const firstValue = table
      .getPreFilteredRowModel()
      .flatRows[0]?.getValue(column.id)

    const columnType = isNaN(+firstValue) ? 'string' : 'number'
  
    const columnFilterValue = column.getFilterValue()
  
    const sortedUniqueValues = Array.from(new Set(extractAllValues({table: table, columnId:column.id})))
  
    const handleClick = () => {
      column.setFilterValue("")
    }
  
    return columnType === 'number' ? (
      <div className='filterValue'>
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue)?.[0] ?? ''}
          onChange={value =>
            column.setFilterValue((old) => [value, old?.[1]])
          }
          placeholder={`Min ${
            column.getFacetedMinMaxValues()?.[0]
              ? `(${column.getFacetedMinMaxValues()?.[0]})`
              : ''
          }`}
        /> {"  -  "}
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue)?.[1] ?? ''}
          onChange={value =>
            column.setFilterValue((old) => [old?.[0], value])
          }
          placeholder={`Max ${
            column.getFacetedMinMaxValues()?.[1]
              ? `(${column.getFacetedMinMaxValues()?.[1]})`
              : ''
          }`}
        />
        <Button onClick={handleClick} sx={{height:25}}>Clear</Button>
      </div>
    ) : sortedUniqueValues.length < 5 ? (
      <div className='filterValue'>
        <DebouncedInput
          select
          selections={sortedUniqueValues}
          id={column.id + 'input'}
          value={(columnFilterValue ?? '')}
          onChange={value => column.setFilterValue(value)}
        />
        <Button onClick={handleClick} sx={{height:25}}>Clear</Button>
      </div>
    ) : (
      <div className='filterValue'>
        <DebouncedInput
          type="text"
          id={column.id + 'input'}
          value={(columnFilterValue ?? '')}
          onChange={value => column.setFilterValue(value)}
          placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        />
        <Button onClick={handleClick} sx={{height:25}}>Clear</Button>
      </div>
    )
  }
  
  // A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 300,
  ...props
}) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  if (props.select) {
    return (
      <FormControl variant='standard'>
        <InputLabel>Value</InputLabel>
        <Select value={value} onChange={e => setValue(e.target.value)} sx={{width:150}}>
          {props.selections.map((value) => {
            return (
              <MenuItem value={value} key={value}>
                {value}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    )
  } else {
    return (
      <FormControl variant='standard'>
        <TextField {...props} variant='standard' value={value} onChange={e => setValue(e.target.value)} />
      </FormControl>
    )
  }
}

function extractAllValues( {table, columnId} ) {
  return table
      .getPreFilteredRowModel()
      .flatRows.map( (row) => {
        return row.original[columnId]
      })
}

export default Filter;