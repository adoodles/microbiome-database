import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';

function ChartSidebar( {setNewCategory} ) {

  return (
    <Sidebar style={{height:"100vh"}}>
      <Menu>
        <SubMenu label="Basic">
          <MenuItem onClick={() => setNewCategory('demographics')}> Demographics </MenuItem>
          <MenuItem onClick={() => setNewCategory('taxonomic')}> Taxonomic </MenuItem>
          <MenuItem onClick={() => setNewCategory('analysis')}> Analysis </MenuItem>
        </SubMenu>
        <SubMenu label="Metaphlan">
          <MenuItem onClick={() => setNewCategory('lefse')}> Cladogram </MenuItem>
          <MenuItem> ??? </MenuItem>
        </SubMenu>
        <MenuItem> TBC? </MenuItem>
      </Menu>
    </Sidebar>
  )
}

export default ChartSidebar;