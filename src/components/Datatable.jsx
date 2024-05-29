import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Papa from 'papaparse';

function DataTableComponent({data_path, next_step}) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [filterValue, setFilterValue] = useState([]);
  const [filterTerms, setFilterTerms] = useState({});

  const [hideHEI, sethideHEI] = React.useState(true);

  const customStyles = {
      rows: {
          style: {
              minHeight: '72px', 
          },
      },
      headCells: {
          style: {
              paddingLeft: '8px', 
              paddingRight: '8px',
          },
      },
      cells: {
          style: {
              paddingLeft: '8px',
              paddingRight: '8px',
          },
      },
  };
  useEffect(() => {
    if (data_path) {
      Papa.parse(data_path, {
        header: true,
        download: true,
        delimiter: ',',
        skipEmptyLines: true,
        complete: (result) => {
          let clean_data = cleanData(result.data)
          console.log(clean_data)
          setData(clean_data);
          setCurrentData(clean_data)
          setFilteredData(clean_data);
        },
      });
    }  
  }, [])

  useEffect(() => {
    setDisplayData(filteredData);
  }, [filteredData])

  useEffect(() => {
    if (filterValue.length < 1) {
      setFilteredData(currentData);
    } else {
      let filtered = currentData.filter((row) =>
        checkFulfill(row[selectedColumn], filterValue, selectedColumn)
      );
      setFilteredData(filtered);
    }
  }, [data, currentData, filterValue]);

  useEffect(() => {
    if (Object.keys(filterTerms).length < 1) {
      setCurrentData(data);
    } else {
      let filterResult = filterAllTerms(data, filterTerms)
      setCurrentData(filterResult)  
    }
  }, [filterTerms])

  const filterAllTerms = (all_data, all_filters) => {
    let remaining_data = all_data
    for (const [column, value] of Object.entries(all_filters)){
      remaining_data = remaining_data.filter((row) =>
        checkFulfill(row[column], value, column)
      );
    }
    return remaining_data;
  }

  const checkFulfill = (row_value, condition_value, column_name) => {
    if (condition_value == []) {
      return true
    }
    if (condition_value.length == 1){
      if (condition_value[0]=='') {
        return true
      }
      if (categoricalColumns.includes(column_name)){
        return row_value.toString() === condition_value[0]
      } else{
        return row_value.toString().toLowerCase().includes(condition_value[0].toLowerCase())
      }
    } else {
      return row_value >= condition_value[0] && row_value <= condition_value[1]
    }
  }
  const renderColumnOptions = (current_data) => {
    if (current_data.length < 1){
      return null
    }
    return current_data.map((header, index) => (
      <option key={`${index}`} value={header}>{header}</option>
    ));
  };

  const renderFilterOptions = (current_data) => {
    if (current_data.length < 1){
      return null
    }
    return current_data.map((header, index) => (
      <option key={`${header}-${index}`} value={header}>{header}</option>
    ));
  };


  const categoricalColumns = ['Gender', 'Nationality', 'SmokingHistory']
  const categoricalChoice = {'Gender': ['Male', 'Female'], 
  'Nationality':['Singaporean', 'Singapore PR', 'Others'], 'SmokingHistory':['Non-smoker', 'Ex-smoker']}

  const renderInputField = () => {
    if (selectedColumn === '') {
      return null;
    } else {
      let dataType = typeof(data[0][selectedColumn]);
      // clean this up with cleanData function
      if (dataType === 'number' || !isNaN(parseFloat(data[0][selectedColumn]))) {
        return (
          <span>
          <input
            type="number"
            name="min_range"
            onChange={handleFilterValueChange}
            placeholder="minimum value" /> 
            <label> - </label>
          <input 
          type="number"
          name="max_range"
          onChange={handleFilterValueChange} 
          placeholder="maximum value" />
          </span>
        );
      } else if (categoricalColumns.includes(selectedColumn)){
        return(
          <select name={`${selectedColumn}_value`} id='cat_select' onChange={handleFilterValueChange}>
            <option value="">Choose value</option>
            {renderFilterOptions(categoricalChoice[selectedColumn])}
          </select>
        );
      } else {
        return (
          <input
            type="text"
            onChange={handleFilterValueChange}
          />
        );
      }
    }
  };

  const renderFilters = (filters) => {
    if (Object.keys(filters).length < 1){
      return null
    }
    return Object.entries(filters).map(([columnName, filterValue]) => (
      <div key={`${columnName}-${filterValue}`} style={{margin: 5 + "px"}}> 
        {`${columnName}: ${filterValue}`}
      </div>
    ));
  };
  
  const handleColumnSelect = (e) => {
    setSelectedColumn(e.target.value);
    setFilterValue([]);
  };

  const textColumns = [...categoricalColumns, 'AMD ID']
  const handleFilterValueChange = (e) => {
    if (textColumns.includes(selectedColumn)) {
      setFilterValue([e.target.value]);
    } else {
      let filterValues = [document.getElementsByName('min_range')[0].value, document.getElementsByName('max_range')[0].value]
      filterValues = fillNumberFilter(filterValues)
      setFilterValue(filterValues)
    }
  };

  const fillNumberFilter = (filter) => {
    if (filter[0] == 'undefined' || filter[0] == '') {
      filter[0] = Number.NEGATIVE_INFINITY;
    } 
    if (filter[1] == 'undefined' || filter[1] == '') {
      filter[1] = Number.POSITIVE_INFINITY;
    }
    return filter
  }

  const handleAddFilter = () => {
    if (checkValidAdd()){
      setFilterTerms({...filterTerms, [selectedColumn]: filterValue})    
      setSelectedColumn('');
      setFilterValue([]);
    }
  }

  const checkValidAdd = () => {
    console.log(filterValue)
    if ( selectedColumn == '' ) {
      return false
    } else if ( selectedColumn.length == 1 && selectedColumn[0] == '' ) {
      return false
    } else if ( filterValue.length < 1 ) {
      return false
    }
    return true
  }

  const handleReset = () => {
    //document.getElementsByName('column_select').value = '';
    setSelectedColumn('');
    setFilterValue([]);
    setFilterTerms({});
  }

  const handleSubmit = () => {
    let result = [];
    result = getSampleNames(filteredData, 'Sample');
    next_step(result);
  }

  const getSampleNames = (target, sample_header) => {
    var result = target.map( a => a[sample_header]);
    return result
  }

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

  // Define table columns
  const hide = (column) => {
    if (column == 'AMD ID') {
      return false
    }
    if (column.includes('_per_day')){
      return hideHEI
    }
    return !hideHEI
  }

  const columns = React.useMemo( () => 
    data.length > 0 ? 
    Object.keys(data[0]).map((key) => (
      { name: key, 
        maxWidth: "250px", 
        minWidth:"100px", 
        selector: (row) =>  row[key],
        omit: hide(key)
      })) : []
    , [data, hideHEI]);
  const column_names = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <>
  <div className="line"></div>
  <div className="form">
    <div className="select">
      <label>Select Column: </label>
      <select name="column_select" value={selectedColumn} onChange={handleColumnSelect}>
        <option value="">Choose a column</option>
        {renderColumnOptions(column_names)}
      </select>
    </div>
    <div className="filter">
      <label>Filter Value: </label>
      {renderInputField()}
    </div>
    <button onClick={handleAddFilter}>
      Add
    </button>
    <div className="buttons" style={{display:'flex', justifyContent:'space-between'}}>
      <div style={{ display: 'flex' }}>
        {renderFilters(filterTerms)}
      </div>
      <div>
        <button onClick={handleReset}>
          Reset 
        </button>
        <button onClick={handleSubmit}>
          Next
        </button>
      </div>
    </div>
  </div>
  <div>
  </div>
  <button onClick={() => sethideHEI(!hideHEI)}>Toggle HEI</button>
  <DataTable columns={columns} data={displayData} customStyles={customStyles} pagination/>
  </>
  )
}

export default DataTableComponent