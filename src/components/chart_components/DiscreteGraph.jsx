import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

export function DiscreteGraph({graph_data, id, groupid}) {
  let graphKeys = ['count']
  if (groupid) {
    let allKeys = graph_data[0].keys()
    let idIndex = allKeys.indexOf('id')
    allKeys.splice(idIndex, 1)
    graphKeys = allKeys
  }

  return (
    <ResponsiveBar
      data={graph_data}
      keys={graphKeys}
      indexBy="id"
      margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
      padding={ graph_data.length < 5? 0.6 : 0 }
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
  )
}