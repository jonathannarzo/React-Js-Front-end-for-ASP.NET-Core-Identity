import { Modal } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-feather";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import { useEffect, useState, useMemo } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Roles = () => {
    const rolesUrl = "Roles/";
    const axiosPrivate = useAxiosPrivate();

    const [modalShow, setModalShow] = useState(false);
    const handleModalClose = () => setModalShow(false);
    const handleModalShow = () => setModalShow(true);
    const [modalTitle, setModalTitle] = useState("");

    // Id which is the primary key of the user
    const [Id, setId] = useState<string>("0");

    // form datas to be used in the user info
    const [formData, setformData] = useState({
        Id: "0",
        Name: "",
    });

    // List of user data
    const [dataList, setDataList] = useState<any[]>([]);

    // Paging
    const [dataListPage, setDataListPage] = useState({
        pageIndex: 1,
        hasNextPage: true,
        hasPreviousPage: false,
        totalPages: 5,
    });

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        getDataList();
    }, []);

    // method to get all roles
    const getDataList = async (pageNum = 1) => {
        var page = rolesUrl + "?pageNum=" + pageNum;

        try {
            const response = await axiosPrivate.get(page);

            setDataList(response.data.dataList);

            setDataListPage({
                pageIndex: response.data.pageIndex,
                hasNextPage: response.data.hasNextPage,
                hasPreviousPage: response.data.hasPreviousPage,
                totalPages: response.data.totalPages,
            });
        } catch (error) {
            console.log(error);
        }
    };

    // method used in data list paging
    const handlePage = (pageIndex: number) => {
        getDataList(pageIndex);
    };

    // method to handle form inputs on change
    const handleChange = (e: { target: { name: any; value: any } }) =>
        setformData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));

    // method to create new category
    const handleCreate = (formData: { Id: string; Name: string }) => {
        axios
            .post(rolesUrl, formData)
            .then(function (response) {
                toast.success("Role successfully added!");
                getDataList();
                resetForm();
                handleModalClose();
                return true;
            })
            .catch(function (error) {
                setErrors(error?.response?.data?.errors);
                return false;
            });
    };

    // handles the submission of form
    const handleSubmit = (e: { preventDefault: () => void; target: any }) => {
        e.preventDefault();
        handleCreate(formData);
    };

    const handeDelete = (Id: string) => {
        axios
            .delete(rolesUrl + Id)
            .then(function (response) {
                toast.success("Role successfully deleted!");
                getDataList();
                return true;
            })
            .catch(function (error) {
                console.log(error);
                return false;
            });
    };

    // Clear all form fields
    const resetForm = () => {
        setformData({
            Id: "0",
            Name: "",
        });
        setErrors({});
    };

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">Roles</h1>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <div className="btn-group me-2">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => {
                                setId("0");
                                setModalTitle("Add Role");
                                resetForm();
                                handleModalShow();
                            }}
                        >
                            Add Role
                        </button>
                    </div>
                </div>
            </div>

            <table className="table table-striped table-bordered table-hover table-sm">
                <thead>
                    <tr>
                        <th>Role Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {dataList.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                        window.confirm(
                                            "Are you sure to delete role (" +
                                                item.name +
                                                ")?"
                                        ) && handeDelete(item.id)
                                    }
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {dataList.length < 1 && (
                        <tr>
                            <td colSpan={4}>No record found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="btn-group me-2">
                <button
                    className={
                        dataListPage.hasPreviousPage
                            ? "btn btn-light btn-sm"
                            : "btn btn-light btn-sm disabled"
                    }
                    onClick={() => handlePage(dataListPage.pageIndex - 1)}
                >
                    <ChevronLeft />
                    Prev
                </button>
                <button
                    className={
                        dataListPage.hasNextPage
                            ? "btn btn-light btn-sm"
                            : "btn btn-light btn-sm disabled"
                    }
                    onClick={() => handlePage(dataListPage.pageIndex + 1)}
                >
                    Next
                    <ChevronRight />
                </button>
            </div>

            <Modal
                show={modalShow}
                onHide={handleModalClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <form method="post" onSubmit={handleSubmit} id="userForm">
                    <Modal.Body>
                        <div className="mb-3 row">
                            <label
                                htmlFor="Name"
                                className="col-sm-3 col-form-label"
                            >
                                Role Name
                            </label>
                            <div className="col-sm-9">
                                <input
                                    type="text"
                                    className={`form-control ${
                                        errors?.Name ? "is-invalid" : ""
                                    }`}
                                    name="Name"
                                    autoComplete="off"
                                    value={formData.Name}
                                    onChange={handleChange}
                                />
                                <div className="invalid-feedback">
                                    {errors?.Name}
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                            onClick={handleModalClose}
                        >
                            Close
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    );
};

export default Roles;
