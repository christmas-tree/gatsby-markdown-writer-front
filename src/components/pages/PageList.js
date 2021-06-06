import {useEffect, useMemo, useState} from "react";
import DataTable from 'react-data-table-component';
import {Alert, Button, FormControl} from "react-bootstrap";
import {useHistory, useLocation} from "react-router-dom";
import apiService from "../service/apiService";

const FilterComponent = ({filterText, onFilter, onClear}) => (
    <>
        <FormControl type="text" placeholder="Filter" size="sm" className="mx-1 w-25" value={filterText}
                     onChange={onFilter}/>
        <Button type="button" variant="outline-secondary" size="sm" className="mx-1" onClick={onClear}>Clear</Button>
    </>
);

const PageList = () => {
    const searchQuery = new URLSearchParams(useLocation().search).get('q');

    const [selectedRows, setSelectedRows] = useState({selectedCount: 0});
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [posts, setPosts] = useState([]);
    const history = useHistory();
    const defaultPage = 1;

    const loadPosts = () => {
        console.log("Loading Data");
        apiService.getAllPosts()
            .then((resp) => {
                const {data, error} = resp.data;
                setErrorMessage(error);
                if (error) return;
                setPosts(data);
            })
            .catch((err) => {
                setErrorMessage(err.toString());
            });
    }

    useEffect(() => {
        loadPosts();
    }, []);

    useEffect(() => {
        setFilterText(searchQuery ? searchQuery : '');
    }, [searchQuery]);

    let filteredData;
    if (filterText) {
        filteredData = posts.filter(item => {
            const thingsToFilter = [item.title, item.tags.toString(), item.slug];
            return thingsToFilter.some((thing) => thing.toLowerCase().includes(filterText.toLowerCase()));
        });
    } else {
        filteredData = posts;
    }

    const columns = [
        {
            name: 'Published',
            selector: 'date',
            sortable: true,
            format: (row) => new Date(row.date).toLocaleString(),
        },
        {
            name: 'Title',
            selector: 'title',
            sortable: true,
        },
        {
            name: 'Slug',
            selector: 'slug',
            sortable: true,
        },
        {
            name: 'Tags',
            selector: 'tags',
            sortable: false,
            format: (row) => row.tags ? row.tags.join(', ') : "",
        },
    ];

    const handleRowClick = (row) => {
        history.push("/edit/" + row.slug);
    }

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };
        return (
            <FilterComponent onFilter={e => setFilterText(e.target.value)}
                             onClear={handleClear}
                             filterText={filterText}
                             key="filter"
            />
        );
    }, [filterText, resetPaginationToggle]);

    const buttonDelete = <Button variant="outline-danger" className="mx-1" size="sm" key="btnDelete"
                                 disabled={selectedRows.selectedCount === 0}>Delete</Button>;
    return (
        <>
            {errorMessage && (
                <Alert variant="danger">
                    {errorMessage}
                    <Button variant="light" onClick={loadPosts}>Reload</Button>
                </Alert>
            )}
            <DataTable
                title="Posts"
                data={filteredData}
                columns={columns}
                keyField={'slug'}
                onSelectedRowsChange={setSelectedRows}
                selectableRows
                striped
                highlightOnHover
                pointerOnHover
                noDataComponent={`No posts here`}
                onRowClicked={handleRowClick}
                selectableRowsHighlight
                pagination
                paginationDefaultPage={defaultPage}
                paginationResetDefaultPage={resetPaginationToggle}
                subHeader
                subHeaderComponent={[subHeaderComponentMemo, buttonDelete]}
            />
        </>
    )
}


export default PageList;