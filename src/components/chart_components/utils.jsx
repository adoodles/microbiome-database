import { bin, max, min, group, deviation, mean } from "d3-array"

export function extractCountByID(id, data) {
  if (continuousID.includes(id)) {
    return extractContinuous(id, data)
  } else if (categoricalID.includes(id)) {
    return extractByCategory(id, data)
  }
}

export function extractCountByIDGroup(id, data, secondary) {
  if (continuousID.includes(id)) {
    if (id == secondary){
      return extractCountByID(id, data)
    } else {
      return extractToBoxPlot({cont:id, data, cat:secondary})
    }
  } else if (categoricalID.includes(id)) {
    if (id == secondary){
      return extractByCategory(id, data)
    } else {
      return extractByCategoryGroup(id, data, secondary)
    }
  }
}

export function extractRaceData(id, data) {
  let results = []
  let raceCats = ['Paternal Race', 'Maternal Race']
  for (const cat of raceCats) {
    let currentEntry = {}
    currentEntry['id'] = cat
    let valuesByCat = group(data, (d) => d[cat])
    let arrayValues = [...valuesByCat]  
    arrayValues.forEach((catEntry) => currentEntry[catEntry[0]] = catEntry[1].length)
    results.push(currentEntry)
  }
  return results
}

export function extractScatterPlots(id1, id2, data){
  let values = data.map((entry => ({
    x: entry[id1],
    y: entry[id2]
  })))
  return [{
    "id": "everything",
    "data": removeScatterOutliers(values)
  }]
}

export function extractScatterPlotsGroup(id1, id2, data, secondary) {
  let valuesByCat = group(data, (d) => d[secondary])
  let arrayValues = [...valuesByCat]
  return arrayValues.map((catEntry) => ({
    id: catEntry[0],
    data: removeScatterOutliers(catEntry[1].map(entry => ({
      x: entry[id1],
      y:entry[id2]
    })))
  }))
}

export function extractScatterPlotsCont(id1, id2, data, secondary) {
  let contValues = data.map((entry) => entry[secondary])
  let min_value = Math.floor(min(contValues, function(d) { return parseFloat(d)}))
  let binGenerator = bin().value(d => d[secondary]).domain([min_value, Math.ceil(max(contValues, function(d) { return parseFloat(d) }))]).thresholds(6)
  let binned = binGenerator(data)
  let results = binned.map((bucket) => ({
    id:bucket.x0 + '-' + bucket.x1,
    data: removeScatterOutliers(bucket.slice(0, -2).map(entry => ({
      x: entry[id1],
      y: entry[id2]
    })))
  }))
  return trimmedScatterBins(results)
}

export function extractIDsClado(data, category) {
  if (category == ""){
    return data.map((entry) => [entry['AMD ID'], entry["Paternal Race"], entry['Maternal Race']])
  } else if (category == "Maternal Race"){
    return data.map((entry) => [entry['AMD ID'], entry["Maternal Race"], entry['Paternal Race']])
  } else {
    return data.map((entry) => [entry['AMD ID'], entry[category], entry['Maternal Race']])
  }

  
}

export function isScatter(id) {
  return scatterID.includes(id)
}

export function isContinuous(id) {
  return continuousID.includes(id)
}

export function isCategorical(id) {
  return categoricalID.includes(id)
}

function extractByCategory(cat, data) {
  let valuesByCat = group(data, (d) => d[cat])
  let arrayValues = [...valuesByCat]
  return arrayValues.map((catEntry) => ({
    id: catEntry[0],
    count: catEntry[1].length
  }))
}

function extractContinuous(cat, data) {
  let catValues = data.map((entry) => ({
    id:entry['AMD ID'],
    value: entry[cat]
  }))
  return catValues.sort(function(a, b){ return b.value - a.value })
}

function extractToBoxPlot({cat, data, cont}) {
  let result = []
  let valuesByCat = group(data, (d) => d[cat])
  let arrayCat = [...valuesByCat]
  arrayCat.forEach((category) => {
    let entries = formatBoxPlot(category, cont)
    result.push(...entries)
  })
  return result
}

function extractToHistogram(id, data) {
  let values = data.map ((entry) => entry[id])
  let min_value = min(values, function(d) { return parseFloat(d)})
  let binGenerator = bin().domain([min_value, max(values, function(d) { return parseFloat(d) })]).thresholds(10)
  let binned = binGenerator(values)
  return binned.map((bucket) => ({
    id:bucket.x0 + '-' + bucket.x1,
    count: bucket.length
  }))
}

function extractByCategoryGroup(cat, data, secondary) {
  let valuesByCat = group(data, (d) => d[cat], (d) => d[secondary])
  let arrayValues = [...valuesByCat]
  let graphData = formatCategoryMap(arrayValues)
  return graphData
}

function formatCategoryMap(input) {
  let result = []
  let arrayValues = [...input]
  for (let entry of arrayValues) {
    let entryresult = {}
    let id = entry[0]
    let valArray = [...entry[1]]
    let values = valArray.forEach((subcategory) => (
      entryresult[subcategory[0]]= subcategory[1].length
    ))
    entryresult['id'] = id
    result.push(entryresult)
  }
  return result
}

function formatBoxPlot(entry, contID) {
  let groupID = entry[0]
  let entryValues = entry[1]
  let values = entryValues.map((entry) => entry[contID])
  let mu = mean(values)
  let sd = deviation(values)
  let n = values.length
  return values.map((entry) => ({
    group: groupID,
    mu: mu,
    sd: sd,
    n: n,
    value: parseFloat(entry)
  }))
}

function removeScatterOutliers(values){
  let xValues = values.map(val => val.x)
  let yValues = values.map(val => val.y)

  let q1x = quantile(xValues, 0.25);
  let q3x = quantile(xValues, 0.75);
  let iqrX = q3x - q1x;

  let q1y = quantile(yValues, 0.25);
  let q3y = quantile(yValues, 0.75);
  let iqrY = q3y - q1y;

  let lowerBoundX = q1x - 1.5 * iqrX;
  let upperBoundX = q3x + 1.5 * iqrX;

  let lowerBoundY = q1y - 1.5 * iqrY;
  let upperBoundY = q3y + 1.5 * iqrY;

  return values.filter(point => 
    point.x >= lowerBoundX && point.x <= upperBoundX &&
    point.y >= lowerBoundY && point.y <= upperBoundY
  );
}

function quantile(arr, q) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return parseFloat(sorted[base]) + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

function trimmedScatterBins(scatterBins){
  while(scatterBins[0]['data'].length == 0){
    scatterBins.shift()
  }
  return scatterBins
}


const continuousID = ['Age', 'BMI', 'Raw', 'Microbial', 'Shannon Index']

const categoricalID = ['Gender', 'Nationality', 'Paternal Race', 'Maternal Race', 'Smoking history']

const scatterID = ['PC1', 'PC2', 'PC3', 'PC4', 'PC5']

const HEIcolumns = ['Energy_per_day', 'Protein_per_day', 'Tf_per_day', 'sfa_per_day', 'mufa_per_day', 'pufa_per_day', 'CHO_per_day', 'starch_per_day', 'sugar_per_day', 'fibre_per_day', 'VitaminA_per_day', 'VitaminC_per_day', 'Calcium_per_day', 'Iron_per_day', 'BCarotene_per_day', 'Thiamin_per_day', 'Riboflavin_per_day', 'Potassium_per_day', 'Zinc_per_day', 
'Sum of HEI components (80 points)', 'Final HEI score (100 points)']

export const catMappings = {
  'demographics': ['Age', 'Gender', 'BMI', 'Nationality', 'Paternal Race', 'Maternal Race', 'Smoking history'],
  'taxonomic': ['Raw', 'Microbial'],
  'analysis': ['Shannon Index', 'PC1', 'PC2', 'PC3', 'PC4', 'PC5'],
}

export const specialCat = ['lefse']

export const all_column = ['AMD ID', //
                    ...catMappings['demographics'],
                    ...catMappings['taxonomic'],
                    ...catMappings['analysis']
                    ]
