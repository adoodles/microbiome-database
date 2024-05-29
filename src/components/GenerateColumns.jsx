import { catMappings } from "./chart_components/utils"

const demograph_columns = catMappings['demographics']

const taxo_columns = catMappings['taxonomic']

const analysis_columns = catMappings['analysis']

const HEI_readings = ['Energy_per_day', 'Protein_per_day', 'Tf_per_day', 'sfa_per_day', 'mufa_per_day', 'pufa_per_day', 'CHO_per_day', 'starch_per_day', 'sugar_per_day', 'fibre_per_day', 'VitaminA_per_day', 'VitaminC_per_day', 'Calcium_per_day', 'Iron_per_day', 'BCarotene_per_day', 'Thiamin_per_day', 'Riboflavin_per_day', 'Potassium_per_day', 'Zinc_per_day']

const HEI_summary = ['Sum of HEI components (80 points)', 'Final HEI score (100 points)']

export function generateDemoColumns(columnHelper) {
  return demograph_columns.map((col_name) => (
    columnHelper.accessor( col_name, {
      cell: info => col_name == "BMI" ? parseFloat(info.getValue()).toFixed(2) :info.getValue(),
      footer: props => props.column.id,
      filterFn: col_name == "BMI" ? 'inNumberRange' : 'equalsString' 
    })
  ))
}

export function generateTaxoColumns(columnHelper) {
  return taxo_columns.map((col_name) => (
    columnHelper.accessor( col_name, {
      cell: info => info.getValue(),
      footer: ({ table }) => parseInt(table.getFilteredRowModel().rows.reduce((total, row) => total + row.getValue(col_name), 0)/table.getFilteredRowModel().rows.length)
    })
  ))
}

export function generateAnalysis(columnHelper) {
  return analysis_columns.map((col_name) => (
    columnHelper.accessor( col_name, {
      cell: info => info.getValue(),
      footer: ({ table }) => table.getFilteredRowModel().rows.reduce((total, row) => total + row.getValue(col_name) ? row.getValue(col_name) : 0, 0)/table.getFilteredRowModel().rows.length,
      filterFn: 'inNumberRange'
    })
  ))
}