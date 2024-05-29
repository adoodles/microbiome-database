import React from 'react';
import { useState } from 'react';
import { ResponsiveBar, ResponsiveBarCanvas } from '@nivo/bar';
import { ResponsiveBoxPlot } from '@nivo/boxplot';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { catMappings, extractCountByID, extractCountByIDGroup, extractIDsClado, extractRaceData, extractScatterPlots, extractScatterPlotsCont, extractScatterPlotsGroup, isCategorical, isContinuous, isScatter, specialCat } from './utils';
import HistoGraph from './HistoGraph';
import SpinningComponent from './SpinningComponent';
import ScatterPlot from './ScatterPlot';
import CladogramGraph from './CladogramGraph';

function GenerateChart ({ rawData, category, groupBy }) {
  const [isLoading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState("")

  const displayData = (id, group) => {
    if (group && !isScatter(id)) {
      return extractCountByIDGroup(id, rawData, group)
    }
    let result = extractCountByID(id, rawData)
    return result
  }

  function mapFeatureToGraphs(cat, group){
    if (specialCat.includes(cat)) {
      let idData = extractIDsClado(rawData, group)
      return (
        <CladogramGraph setLoad={setLoading} setMsg={setLoading} data={idData}/>
      )
    }
    return catMappings[cat]?.map( (ids) => {
      if (isContinuous(ids)) {
        return generateContinuousFeature(ids, group)
      } else if (isCategorical(ids)) {
        if (group == "" && (ids == 'Paternal Race' || ids == 'Maternal Race')){
          return generateMulticatFeature(ids, group)
        }
        return generateCategoricalFeature(ids, group)
      } else if (isScatter(ids)) {
        if (ids == "PC1") {
          return generateScatterGraph('PC1', 'PC2', group)
        } else if (ids == "PC3") {
          return generateScatterGraph('PC3', 'PC4', group)
        }
      }
    } )
    if (feature == 'demographics') {
      return catMappings[feature]?.map( (ids) => {
        return(
          <div style={{height: 400, width:800, overflow:'hidden'}}>
            <h3>{ids}</h3>   
            <HistoGraph graph_data={displayData(ids)} id={ids} groupid={groupBy} />
          </div>
        )
      })
    } else if (feature == 'taxonomic') {
      return catMappings[feature]?.map((ids) => {
        return generateHistoGraph(ids)
      })
    } else if (feature == 'analysis') {
      return catMappings[feature]?.map((ids) => {
        if (isScatter(ids)){
          if (ids == 'PC1') {
            return generateScatterGraph('PC1', 'PC2')
          }
        } else {
          return generateHistoGraph(ids)
        }
      })
    }
  }

  function generateMulticatFeature(id, group) {
    // so far it is only race features
    let graph_data = extractRaceData(id, rawData)
    if (id == 'Maternal Race'){
      return
    }
    return (
      <div style={{height: 400, width:800, overflow:'hidden'}}>
      <h3>{'Race'}</h3>
      <ResponsiveBar
        data={graph_data}
        keys={['Chinese', 'Malay', 'Indian', 'Others']}
        indexBy="id"
        groupMode='grouped'
        margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
        padding={graph_data.length < 5? 0.6 : 0}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'category10' }}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                  'darker',
                  1.6
                ]
            ]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Race',
            legendPosition: 'middle',
            legendOffset: 32,
            truncateTickAt: 0,
            format: (value) => value.length > 13 ? "" : value
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Count',
            legendPosition: 'middle',
            legendOffset: -40,
            truncateTickAt: 0
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
        />
        </div>
    )
  }

  function generateContinuousFeature(id, group){
    if (group == "" || id == group) {
      let graph_data = displayData(id, "")
      return (
        <div style={{height: 400, width:800, overflow:'hidden'}}>
        <h3>{id}</h3>
        <ResponsiveBarCanvas
          data={graph_data}
          keys={['value']}
          indexBy="id"
          margin={{ top: 50, right: 30, bottom: 100, left: 30 }}
          padding={0.5}
          innerPadding={0}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'category10' }}
          borderColor={{
              from: 'color',
              modifiers: [
                  [
                    'darker',
                    1.6
                  ]
              ]
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={null}
          axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: id,
              legendPosition: 'middle',
              legendOffset: -40,
              truncateTickAt: 0,
              format: ".2s"
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
              from: 'color',
              modifiers: [
                  [
                      'darker',
                      1.6
                  ]
              ]
          }}
          role="application"
          ariaLabel="Nivo bar chart demo"
          barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
          /> 
      </div>
      )
    } else if (isCategorical(group)) {
      let graph_data = displayData(id, group)

      return (
        <div style={{height: 400, width:800, overflow:'hidden'}}>
        <h3>{id} vs {group}</h3>
        <ResponsiveBoxPlot
        data={graph_data}
        margin={{ top: 60, right: 60, bottom: 100, left: 60 }}
        minValue={'auto'}
        maxValue={'auto'}
        padding={0.5}
        enableGridX={true}
        axisTop={null}
        axisRight={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendOffset: 0,
            truncateTickAt: 0,
            format: ".2s"
        }}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: group,
            legendPosition: 'middle',
            legendOffset: 32,
            truncateTickAt: 0
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: id,
            legendPosition: 'middle',
            legendOffset: -40,
            truncateTickAt: 0,
            format: ".2s"
        }}
        colors={{ scheme: 'category10' }}
        borderRadius={2}
        borderWidth={2}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.3
                ]
            ]
        }}
        medianWidth={2}
        medianColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.3
                ]
            ]
        }}
        whiskerEndSize={0.6}
        whiskerColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.3
                ]
            ]
        }}
        motionConfig="stiff"
        legends={[
            {
                anchor: 'right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemWidth: 60,
                itemHeight: 20,
                itemsSpacing: 3,
                itemTextColor: '#999',
                itemDirection: 'left-to-right',
                symbolSize: 20,
                symbolShape: 'square',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
        />
        </div>
      )
    } else if (isContinuous(group)) {
      return generateScatterGraph(id, group, "")
    }
  }

  function generateCategoricalFeature(id, group) {
    if (group == "" || id == group) {
      let graph_data = displayData(id, "")
      return (
        <div style={{height: 400, width:800, overflow:'hidden'}}>
        <h3>{id}</h3>
        <ResponsiveBar
          data={graph_data}
          keys={['count']}
          indexBy="id"
          margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
          padding={graph_data.length < 5? 0.6 : 0}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'category10' }}
          borderColor={{
              from: 'color',
              modifiers: [
                  [
                    'darker',
                    1.6
                  ]
              ]
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: id,
              legendPosition: 'middle',
              legendOffset: 32,
              truncateTickAt: 0,
              format: (value) => value.length > 13 ? "" : value
          }}
          axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Count',
              legendPosition: 'middle',
              legendOffset: -40,
              truncateTickAt: 0
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
              from: 'color',
              modifiers: [
                  [
                      'darker',
                      1.6
                  ]
              ]
          }}
          role="application"
          ariaLabel="Nivo bar chart demo"
          barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
          />
          </div>
      )
    } else if (isCategorical(group)){
      let graph_data = displayData(id, group)
      let allKeys = Object.keys(graph_data[0])
      let idIndex = allKeys.indexOf('id')
      allKeys.splice(idIndex, 1)
      let graphKeys = allKeys
      return (
        <div style={{height: 400, width:800, overflow:'hidden'}}>
        <h3>{id} by {group}</h3>
        <ResponsiveBar
        data={graph_data}
        keys={graphKeys}
        indexBy="id"
        margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
        padding={ graph_data.length < 5? 0.6 : 0 }
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'category10' }}
        borderColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              1.6
            ]
          ]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: id,
          legendPosition: 'middle',
          legendOffset: 32,
          truncateTickAt: 0,
          format: (value) => String(value).length > 13 ? "" : value
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Count',
          legendPosition: 'middle',
          legendOffset: -40,
          truncateTickAt: 0
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              1.6
            ]
          ]
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
      />
      </div>
      )  
    } else if (isContinuous(group)) {
      return generateContinuousFeature(group, id)
    }
  }
  function generateHistoGraph(id) {
    let graph_data = displayData(id)
    return (
      <div style={{height: 400, width:800, overflow:'hidden'}}>
        <h3>{id}</h3>
        <ResponsiveBar
          data={graph_data}
          keys={['count']}
          indexBy="id"
          margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
          padding={graph_data.length < 5? 0.6 : 0}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'nivo' }}
          borderColor={{
              from: 'color',
              modifiers: [
                  [
                    'darker',
                    1.6
                  ]
              ]
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: id,
              legendPosition: 'middle',
              legendOffset: 32,
              truncateTickAt: 0,
              format: (value) => value.length > 13 ? "" : value
          }}
          axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Count',
              legendPosition: 'middle',
              legendOffset: -40,
              truncateTickAt: 0
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
              from: 'color',
              modifiers: [
                  [
                      'darker',
                      1.6
                  ]
              ]
          }}
          role="application"
          ariaLabel="Nivo bar chart demo"
          barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
      />
    </div>
    )
  }

  function generateScatterGraph(id1, id2, group) {
    if (group == ""){
      let graph_data = extractScatterPlots(id1, id2, rawData)
      return(
        <div style={{height: 800, width:800, overflow:'visible'}}>
        <h3>{id1} vs {id2}</h3>
        <ResponsiveScatterPlot
          data={graph_data}
          margin={{ top: 60, right: 140, bottom: 120, left: 90 }}
          xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
          xFormat=">-.2f"
          yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
          yFormat=">-.2f"
          colors={{ scheme: 'category10' }}
          blendMode="multiply"
          axisTop={null}
          axisRight={null}
          axisBottom={{
              orient: 'bottom',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: id1,
              legendPosition: 'middle',
              legendOffset: 46,
              truncateTickAt: 0
          }}
          axisLeft={{
              orient: 'left',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: id2,
              legendPosition: 'middle',
              legendOffset: -60,
              truncateTickAt: 0
          }}
          legends={[
              {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 130,
                  translateY: 0,
                  itemWidth: 100,
                  itemHeight: 12,
                  itemsSpacing: 5,
                  itemDirection: 'left-to-right',
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                      {
                          on: 'hover',
                          style: {
                              itemOpacity: 1
                          }
                      }
                  ]
              }
          ]}
          />
          </div>
          )
      } else if (isCategorical(group)) {
        let graph_data = extractScatterPlotsGroup(id1, id2, rawData, group)
        return(
          <div style={{height: 800, width:800, overflow:'visible'}}>
          <h3>{id1} vs {id2} by {group}</h3>
          <ResponsiveScatterPlot
            data={graph_data}
            margin={{ top: 60, right: 140, bottom: 120, left: 90 }}
            xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            xFormat=">-.2f"
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            yFormat=">-.2f"
            colors={{ scheme: 'category10' }}
            blendMode="multiply"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: id1,
                legendPosition: 'middle',
                legendOffset: 46,
                truncateTickAt: 0
            }}
            axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: id2,
                legendPosition: 'middle',
                legendOffset: -60,
                truncateTickAt: 0
            }}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 130,
                    translateY: 0,
                    itemWidth: 100,
                    itemHeight: 12,
                    itemsSpacing: 5,
                    itemDirection: 'left-to-right',
                    symbolSize: 12,
                    symbolShape: 'circle',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemOpacity: 1
                            }
                        }
                    ]
                }
            ]}
            />
            </div>
        )  
      }else if (isContinuous(group)) {
        let graph_data = extractScatterPlotsCont(id1, id2, rawData, group)
        console.log(graph_data)
        return(
          <div style={{height: 800, width:800, overflow:'visible'}}>
          <h3>{id1} vs {id2} by {group}</h3>
          <ResponsiveScatterPlot
            data={graph_data}
            margin={{ top: 60, right: 140, bottom: 120, left: 90 }}
            xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            xFormat=">-.2f"
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            yFormat=">-.2f"
            colors={{ scheme: 'blues' }}
            blendMode="normal"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: id1,
                legendPosition: 'middle',
                legendOffset: 46,
                truncateTickAt: 0
            }}
            axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: id2,
                legendPosition: 'middle',
                legendOffset: -60,
                truncateTickAt: 0
            }}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 130,
                    translateY: 0,
                    itemWidth: 100,
                    itemHeight: 12,
                    itemsSpacing: 5,
                    itemDirection: 'left-to-right',
                    symbolSize: 12,
                    symbolShape: 'circle',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemOpacity: 1
                            }
                        }
                    ]
                }
            ]}
            />
            </div>
        )
      }
  }




  return(
    <div>
      {mapFeatureToGraphs(category, groupBy)}
      {isLoading && <SpinningComponent message={loadingMsg}/>}
    </div>
  )
}

export default GenerateChart;
