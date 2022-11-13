import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import React, { useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { useInterval } from "./util";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function App() {
    let data = [
        {
            buildings: "ECSS - Engineering And Computer Science South",
            floorRoom: "2.311",
            available: "true",
        },
        {
            buildings: "ECSW - Engineering And Computer Science West",
            floorRoom: "1.130",
            available: "false",
        },
        {
            buildings: "ECSW - Engineering And Computer Science West",
            floorRoom: "1.375",
            available: "true",
        },
        {
            buildings: "GR - Cecil H. Green Hall",
            floorRoom: "3.810",
            available: "true",
        },
    ];

    //   {buildings: "name", count: 1, rooms: [{floorRoom: "3.810", available: true}]}

    function processData(resData) {
        data = data.concat(resData);
        let newData = [];

        for (let i = 0; i < data.length; i++) {
            let curRoom = data[i];

            if (newData.some((e) => e.buildings == curRoom.buildings)) {
                for (let j = 0; j < newData.length; j++) {
                    let curNewRoom = newData[j];
                    if (curNewRoom.buildings == curRoom.buildings) {
                        let newArray = curNewRoom.rooms;
                        newArray.push({
                            floorRoom: curRoom.floorRoom,
                            available: curRoom.available,
                        });
                        curNewRoom.rooms = newArray;
                        break;
                    }
                }
            } else {
                newData.push({
                    buildings: curRoom.buildings,
                    available: 0,
                    rooms: [
                        {
                            floorRoom: curRoom.floorRoom,
                            available: curRoom.available,
                        },
                    ],
                });
            }
        }

        for (let i = 0; i < newData.length; i++) {
            let curBuilding = newData[i];
            let count = 0;
            let rooms = curBuilding.rooms;

            for (let j = 0; j < curBuilding.rooms.length; j++) {
                let curRoom = rooms[j];
                if (curRoom.available == "true") count += 1;
            }
            newData[i].available = count;
        }
        console.log(newData);

        setRowData(newData);
    }

    useInterval(() => {
        fetch("https://study-buddy-backend.vercel.app/room_status")
            .then((res) => res.json())
            .then((res) => processData(res));
    }, 1000);

    const [rowData, setRowData] = useState();
    const [roomRowData, setRoomRowData] = useState();

    const [query, setQuery] = useState("");

    const [columnDefs, setColumnDefs] = useState([
        { field: "buildings" },
        { field: "available", sortable: true },
    ]);

    const availablityFormatter = (text) => {
        if (text.value == "true") return "Available";
        else return "Occupied";
    };

    const [roomColumnDefs, setRoomColumnDefs] = useState([
        { field: "floorRoom", headerName: "Room Number" },
        {
            field: "available",
            valueFormatter: availablityFormatter,
            sortable: true,
        },
    ]);

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current.api.setQuickFilter(
            document.getElementById("filter-text-box").value
        );
    }, []);

    const gridRef = useRef();
    const autoSizeAll = useCallback(() => {
        const allColumnIds = [];
        gridRef.current.columnApi.getColumns().forEach((column) => {
            allColumnIds.push(column.getId());
        });
        gridRef.current.columnApi.autoSizeColumns(allColumnIds);
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState([
        {
            available: 0,
            buildings: "",
            rooms: [{ floorRoom: "", available: false }],
        },
    ]);

    const togglePopup = () => {
        setIsOpen(!isOpen);
    };

    const onSelectionChanged = useCallback(() => {
        const selectedRow = gridRef.current.api.getSelectedRows();
        setSelectedRow(selectedRow);
        setRoomRowData(selectedRow[0].rooms);
        togglePopup();
    }, []);

    console.log(selectedRow[0].rooms[0].available);

    return (
        <div>
            <div className="flex items-start bg-[#e87500] w-full h-[70px]">
                <img
                    src="https://i.postimg.cc/rsSNWhW2/logo.jpg"
                    border="0"
                    className="mx-10 my-auto text-3xl flex-none rounded-lg w-14 h-14"
                    alt="logo"
                />
            </div>

            <div className="w-[515px]">
                <div className="flex flex-1 items-center justify-left ml-10 mt-5 ">
                    <div className="w-full max-w-lg ">
                        <label htmlFor="search" className="sr-only">
                            Search
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </div>
                            <input
                                // id="search"
                                name="search"
                                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-[45px] pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Building Name"
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
                <div
                    className="ag-theme-alpine pl-10"
                    style={{ height: 550, width: 515 }}
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        onFirstDataRendered={autoSizeAll}
                        cacheQuickFilter={true}
                        rowSelection={"single"}
                        onRowSelected={onSelectionChanged}
                    ></AgGridReact>
                </div>

                <img
                    src="https://i.postimg.cc/mD6dkG8h/placeholder-image.jpg"
                    border="0"
                    className="flex justify-end w-3/6 ml-[100px]"
                    alt="placeholder-image"
                />
            </div>
            {isOpen ? (
                <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div className="relative w-[500px] my-6 mx-auto max-w-3xl">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                {/*header*/}
                                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                                    <h3 className="text-3xl font-semibold">
                                        {selectedRow[0].buildings}
                                    </h3>
                                    <button
                                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none"></span>
                                    </button>
                                </div>
                                {/*body*/}
                                <div className="relative p-6 flex items-center justify-center">
                                    <div
                                        className="ag-theme-alpine"
                                        style={{ height: 550, width: 400 }}
                                    >
                                        <AgGridReact
                                            rowData={roomRowData}
                                            columnDefs={roomColumnDefs}
                                            onFirstDataRendered={autoSizeAll}
                                        ></AgGridReact>
                                    </div>
                                </div>
                                {/*footer*/}
                                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                                    <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </div>
    );
}

export default App;
