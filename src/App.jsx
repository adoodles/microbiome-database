import React, { useState, useEffect } from 'react';
import DataTableComponent from './components/Datatable';
import TanDatatable from './components/TanDatatable';
import AnalysisPage from './components/AnalysisPage';
import './App.css'

function App() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);

  const selectNext = (entries) => {
    setSelected(entries);
    setStep(step + 1);
  }

  const selectPrev = () => {
    if (step > 0){
      setStep(step - 1)
    }
  }

  const data_path = "/amili_200324.csv"

  const styleclass = step == 0 ? "data-table" : "analysis"

  const renderContent = () => {
    if (step == 0) {
      return (
        //<DataTableComponent data_path={data_path} next_step={selectNext}/>
        <TanDatatable data_path={data_path} next_step={selectNext} />
      )
    }
    else if (step == 1){
      return (
        <AnalysisPage selectedIDs={selected} setBack={selectPrev}/>
      )
    }
  }
  return (
    <>
    <div className={styleclass}>
      {renderContent()}
    </div>
    </>
  )
}

export default App
