import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import React, { useState, useRef, useCallback} from 'react';
import { AgGridReact } from 'ag-grid-react';
import Popup from './Popup';

import 'ag-grid-community/styles/ag-grid.css'; 
import 'ag-grid-community/styles/ag-theme-alpine.css';

function App() {

    const data = [
        {buildings: "ECSS - Engineering And Computer Science South", floorRoom: "2.311", available: true},
        {buildings: "ECSW - Engineering And Computer Science West", floorRoom: "1.130", available: false},
        {buildings: "ECSW - Engineering And Computer Science West", floorRoom: "1.375", available: false},
        {buildings: "GR - Cecil H. Green Hall", floorRoom: "3.810", available: true}
    ]

    let newData = []
    
    for(let i=0; i < data.length; i++) {
        let curBuilding = data[i].buildings;

        if (!newData.some(e => e.buildings == curBuilding))
            newData.push({buildings: curBuilding, available: 1});
        else {
            for (let j=0; j<newData.length; j++) {
                let pog = newData[j];

                if (pog.buildings == curBuilding)
                    newData[j].available = newData[j].available + 1;
            }
        }
    }
    console.log(newData)

    const [rowData] = useState(newData);

    const [query, setQuery] = useState("");

    const [columnDefs, setColumnDefs] = useState([
        { field: 'buildings' },
        { field: 'available', sortable: true}
    ])

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current.api.setQuickFilter(
          document.getElementById('filter-text-box').value
        );
      }, []);

    const gridRef = useRef();
    const autoSizeAll = useCallback(() => {
        const allColumnIds = [];
        gridRef.current.columnApi.getColumns().forEach((column) => {
            allColumnIds.push(column.getId());
        });
        gridRef.current.columnApi.autoSizeColumns(allColumnIds);
    }, [])

    const [isOpen, setIsOpen] = useState(false);
    const togglePopup = useCallback((event) => {
        setIsOpen(!isOpen);
        var buildingName = event.node.data.buildings;
        var roomNames = event.node.data.floorRoom;
        {isOpen && <Popup
            content={<>
        <b>{buildingName} Building Availability</b>
        <br />
        {roomNames} <a>

        event.node.setSelected(false);

        {event.node.data.available == 0 && (
        <p>No rooms available from this building.</p>

        )}

        </a>
        

        </>}
        handleClose={togglePopup}
        />}
      }, []);

    return (
        <div>
            <div className="flex items-start bg-[#e87500] w-full h-[70px]">
                <img src='https://i.postimg.cc/rsSNWhW2/logo.jpg' border='0' 
                className="mx-10 my-auto text-3xl flex-none rounded-lg w-14 h-14"alt='logo'/>
            </div>

            

            <div className='w-[515px]'>
                <div className="flex flex-1 items-center justify-left ml-10 mt-5 ">
                    <div className="w-full max-w-lg ">
                    <label htmlFor="search" className="sr-only">
                        Search
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                        id="search"
                        name="search"
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-[45px] pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Search by: Building Name, Keyword, Etc"
                        type="search"
                        id="filter-text-box"
                        onChange={(e) => {
                            setQuery(e.target.value);
                            onFilterTextBoxChanged();
                        }}
                        />
                    </div>
                    </div>
                </div>
            </div>

            <div className="inline-flex mt-5">
                
                <div className="ag-theme-alpine pl-10" style={{height: 550, width: 515}}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            onFirstDataRendered={autoSizeAll}
                            cacheQuickFilter={true}
                            rowSelection={'single'}
                            onRowSelected={togglePopup}>
                        </AgGridReact>
                </div>
                
                    <img src='https://i.postimg.cc/mD6dkG8h/placeholder-image.jpg' border='0' 
                    className="flex justify-end w-3/6 ml-[100px]"
                    alt='placeholder-image'/>

            </div>

        </div>
    )
}

export default App;
