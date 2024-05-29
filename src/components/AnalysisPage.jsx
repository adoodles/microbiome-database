import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { getBaseStats, getMetaphlanStats } from './MockServer';
import GenerateChart from './chart_components/GenerateChart';
import ChartSidebar from './chart_components/Sidebar';
import { catMappings } from './chart_components/utils';
import './AnalysisPage.css'

const AnalysisPage = ({ selectedIDs, setBack }) => {
  const [availableFiles, setAvailableFiles] = useState([]);
  const [baseStats, setBaseStats] = useState([])
  const [metaphlanStats, setMetaphlanStats] = useState([])
  const [selectedStats, setSelectedStats] = useState('demographics')
  const [secondaryStat, setSecondaryStat] = useState("")

  useEffect(() => {
    checkStats()
  }, [])

  const count = selectedIDs.length;

  // Function to fetch available files related to selected IDs
  const fetchAvailableFiles = async (ids) => {
    try {
      // Perform API request to fetch files related to the selected IDs
      const response = await fetch(`https://example.com/api/files?ids=${ids.join(',')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setAvailableFiles(data.files); // Assuming the response contains an array of files
    } catch (error) {
      console.error('Error fetching available files:', error);
    }
  };

  const backPage = () => {
    setBack();
  }

  function checkStats(){
    getBaseStats(selectedIDs, setBaseStats)
    getMetaphlanStats(selectedIDs, setMetaphlanStats)
  }

  function renderGraphs(category) {
    if (baseStats == []) {
      return[]
    } else {
      return (
        <GenerateChart rawData={baseStats} category={category} groupBy={secondaryStat}/>
      )
    }
  }

  const handleSecondaryChange = (e) => {
    setSecondaryStat(e.target.value)
  }

  return (
    <div className="analysisPage">
      <div className="navbar">
        <ChartSidebar setNewCategory={setSelectedStats}/>
      </div>
      <div className="charts">
        <p>Entry Count: {count}</p>
        {renderGraphs(selectedStats)}
        <button onClick={checkStats}>Check</button>
        <button onClick={backPage}>Back</button>
      </div>
      <div className='selectSecondary'>
        <FormControl variant='standard' sx={{width: 150}}>
          <InputLabel>Group By:</InputLabel>
          <Select value={secondaryStat} onChange={handleSecondaryChange}>
            <MenuItem value={''} key={'None'}>None</MenuItem>
            {catMappings['demographics'].map((category) => {
              return (
                <MenuItem value={category} key={category}>
                  {category}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

export default AnalysisPage;
