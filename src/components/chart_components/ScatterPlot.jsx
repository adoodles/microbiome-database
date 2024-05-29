import React from 'react';
import { ResponsiveScatterPlot } from '@nivo/scatterplot'

function ScatterPlot({graph_data, id1, id2, groupid}){
  

  return(
    <div style={{height: 900, width:900, overflow:'hidden'}}>
    <h3>{id1} vs {id2}</h3>
    <ResponsiveScatterPlot
      data={graph_data}
      margin={{ top: 60, right: 140, bottom: 120, left: 90 }}
      xScale={{ type: 'symlog', min: 'auto', max: 'auto' }}
      xFormat=">-.2f"
      yScale={{ type: 'symlog', min: 'auto', max: 'auto' }}
      yFormat=">-.2f"
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
}

export default ScatterPlot;