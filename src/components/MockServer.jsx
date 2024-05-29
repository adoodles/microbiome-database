import Papa from 'papaparse';


const filterIDs = (data, selectedIDs) => {
  return data.filter(x => selectedIDs.includes(x['AMD ID']))
}


export function getBaseStats(selectedIDs, setBaseStats) {
  const base_data_path = "/amili_200324.csv"
  let selected_data = []
  if (base_data_path) {
    Papa.parse(base_data_path, {
        header: true,
        download: true,
        delimiter: ',',
        skipEmptyLines: true,
        complete: (result) => {
          selected_data = filterIDs(result.data, selectedIDs);
          setBaseStats(selected_data)
        }
    });
  }  
}

export function getMetaphlanStats(selectedIDs, setMetaphlanStats) {
  const metaphlan_path = "/amili_taxoprofile.tsv"
  let selected_data = []
  if (metaphlan_path) {
    Papa.parse(metaphlan_path, {
        header: true,
        download: true,
        delimiter: '\t',
        skipEmptyLines: true,
        complete: (result) => {
        selected_data = result.data;
        setMetaphlanStats(selected_data);
        },
    });
  }  
  return selected_data
}
