import { Modal } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-feather";
import { toast } from "react-toastify";
import { useEffect, useState, useMemo } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { confirm } from "../../utils/confirm";

const Users = () => {
    const accountUrl = "Account/";
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
        Email: "",
        FirstName: "",
        LastName: "",
        Password: "",
        PhoneNumber: "",
        Roles: [],
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

    // List of roles
    const [rolesData, setRolesData] = useState<any[]>([]);

    const [errors, setErrors] = useState<any>({});

    const [loading, setLoading] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [loadingUserData, setLoadingUserData] = useState<boolean>(false);

    useEffect(() => {
        getDataList();
        getRoles();
    }, []);

    // method to get all users
    const getDataList = async (pageNum = 1) => {
        var page = accountUrl + "?pageNum=" + pageNum;

        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const getRoles = async () => {
        try {
            const response = await axiosPrivate.get(rolesUrl);
            var roleData = response.data;

            response.data.map(
                (item: any, index: number) => (roleData[index].checked = false)
            );

            setRolesData(roleData);
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

    const normalizeErrors = (
        errorObj: Record<string, string[]>
    ): Record<string, string[]> => {
        const normalized: Record<string, string[]> = {};

        for (const key in errorObj) {
            const lowerKey = key.toLowerCase();

            // Handle 'password' errors
            if (lowerKey.includes("password")) {
                if (!normalized["Password"]) {
                    normalized["Password"] = [];
                }
                normalized["Password"].push(...errorObj[key]);
            }
            // Handle 'email' errors
            else if (lowerKey.includes("email")) {
                if (!normalized["Email"]) {
                    normalized["Email"] = [];
                }
                normalized["Email"].push(...errorObj[key]);
            } else {
                normalized[key] = errorObj[key];
            }
        }

        return normalized;
    };

    // method to create new category
    const handleCreate = (formData: {
        Id: string;
        Email: string;
        FirstName: string;
        LastName: string;
        Password: string;
        PhoneNumber: string;
        Roles: string[];
    }) => {
        setSubmitLoading(true);
        axiosPrivate
            .post(accountUrl + "register", formData)
            .then(function (response) {
                toast.success("User successfully added!");
                getDataList();
                resetForm();
                handleModalClose();
                return true;
            })
            .catch(function (error) {
                var errorInfo = error?.response?.data?.errors;
                var normalizedErrors = normalizeErrors(errorInfo);
                setErrors(normalizedErrors);
                return false;
            })
            .finally(() => {
                setSubmitLoading(false);
            });
    };

    // Show data of categories in the form field
    const handleEdit = (Id: string) => {
        setModalTitle("Edit User");
        handleModalShow();
        resetForm();

        // set the Id of the data to edit
        setId(Id);

        setLoadingUserData(true);
        axiosPrivate
            .get(accountUrl + Id)
            .then((result) => {
                // information of the clicked user
                const userData = result.data.user;
                // array of user roles names
                const roleArr = result.data.role;

                // Update roles data checkbox depending on the chosen user
                setRolesData((prevState) => {
                    const newState = Array.from(prevState);
                    prevState.map((item, index) => {
                        // if role is a role array of user then set check box to checked(true) else checked(false)
                        newState[index]["checked"] =
                            roleArr.indexOf(item.name) > -1 ? true : false;
                    });
                    return newState;
                });

                // set form data to the selected user
                setformData({
                    Id: Id,
                    Email: userData.email ?? "",
                    FirstName: userData.firstName ?? "",
                    LastName: userData.lastName ?? "",
                    Password: "",
                    PhoneNumber: userData.phoneNumber ?? "",
                    Roles: roleArr,
                });

                return true;
            })
            .catch((error) => {
                console.log(error);
                return false;
            })
            .finally(() => {
                setLoadingUserData(false);
            });
    };

    // method to update a category
    const handleUpdate = (formData: {
        Id: string;
        Email: string;
        FirstName: string;
        LastName: string;
        PhoneNumber: string;
        Roles: string[];
    }) => {
        setSubmitLoading(true);
        axiosPrivate
            .put(accountUrl + Id, formData)
            .then(function (response) {
                toast.success("User successfully updated!");
                getDataList();
                return true;
            })
            .catch(function (error) {
                console.log(error);
                return false;
            })
            .finally(() => {
                setSubmitLoading(false);
            });
    };

    // handles the update and create of category
    const handleSubmit = (e: { preventDefault: () => void; target: any }) => {
        e.preventDefault();

        const selectedRoles = rolesData
            .filter((item) => item.checked)
            .map((item) => item.name); // Collect names of the checked roles
        // Update formData with selected roles
        const updatedFormData = { ...formData, Roles: selectedRoles };

        if (Id !== "0") {
            // if id not zero update the existing record
            updatedFormData.Id = Id;
            handleUpdate(updatedFormData);
        } else {
            // create new record if id is not assigned
            handleCreate(updatedFormData);
        }
    };

    const handeDelete = async (Id: string, FirstName: string) => {
        const confirmDelete = await confirm({
            title: "Delete User",
            message:
                "Are you sure you want to delete user (" + FirstName + ")?",
        });

        // deleting cancelled
        if (!confirmDelete) return false;

        // Proceed to delete
        axiosPrivate
            .delete(accountUrl + Id)
            .then(function (response) {
                toast.success("User successfully deleted!");
                getDataList();
                return true;
            })
            .catch(function (error) {
                console.log(error);
                return false;
            });
    };

    /**
     * Transform Data into an object where ID becomes a key
     */
    const rolesById = useMemo(() => {
        return rolesData.reduce((acc, role) => {
            acc[role.id] = role;
            return acc;
        }, {} as Record<string, any>);
    }, [rolesData]);
    // Returns the role name of the specified id
    const returnUserRole = (id: string) => rolesById[id]?.name ?? "Unknown";

    // Clear all form fields
    const resetForm = () => {
        setformData({
            Id: "0",
            Email: "",
            FirstName: "",
            LastName: "",
            Password: "",
            PhoneNumber: "",
            Roles: [],
        });

        // set role to checked(false)
        setRolesData((prevState) =>
            prevState.map((item) => ({
                ...item,
                checked: false,
            }))
        );

        // Reset form error
        setErrors({});
    };

    const updateCheckStatus = (e: any) => {
        // index of the clicked role
        var targetCb = e.target.id.split("_")[1];

        // update the state of the role checkbox depending whether it is checked or not
        setRolesData((prevState) => {
            const newState = Array.from(prevState);
            newState[targetCb]["checked"] = e.target.checked;
            return newState;
        });
    };

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">Users</h1>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <div className="btn-group me-2">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => {
                                setId("0");
                                setModalTitle("Add User");
                                resetForm();
                                handleModalShow();
                            }}
                        >
                            Add User
                        </button>
                    </div>
                </div>
            </div>

            <table className="table table-striped table-bordered table-hover table-sm">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>FirstName</th>
                        <th>LastName</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="text-center">
                                <div
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ) : dataList.length > 0 ? (
                        dataList.map((item, index) => (
                            <tr key={index}>
                                <td>{item.email}</td>
                                <td>{item.firstName}</td>
                                <td>{item.lastName}</td>
                                <td>{item.phoneNumber}</td>
                                <td>
                                    {item.userRoles?.length ? (
                                        item.userRoles.map(
                                            (ui: any, n: number) => (
                                                <div key={n}>
                                                    {returnUserRole(ui.roleId)}
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <div>No roles assigned</div>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleEdit(item.id)}
                                    >
                                        Edit
                                    </button>
                                    &nbsp;
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                            handeDelete(item.id, item.firstName)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6}>No record found.</td>
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
                        {loadingUserData && (
                            <div>
                                <div className="d-flex align-items-center">
                                    <small>
                                        <strong>Loading User data..</strong>
                                    </small>

                                    <div
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                    ></div>
                                </div>
                                <br />
                            </div>
                        )}
                        <div className="mb-3 row">
                            <label
                                htmlFor="Email"
                                className="col-sm-2 col-form-label"
                            >
                                Email
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${
                                        errors?.Email ? "is-invalid" : ""
                                    }`}
                                    name="Email"
                                    autoComplete="off"
                                    value={formData.Email}
                                    onChange={handleChange}
                                />
                                <div className="invalid-feedback">
                                    {errors?.Email}
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label
                                htmlFor="FirstName"
                                className="col-sm-2 col-form-label"
                            >
                                FirstName
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${
                                        errors?.FirstName ? "is-invalid" : ""
                                    }`}
                                    name="FirstName"
                                    autoComplete="off"
                                    value={formData.FirstName}
                                    onChange={handleChange}
                                />
                                <div className="invalid-feedback">
                                    {errors?.FirstName}
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label
                                htmlFor="LastName"
                                className="col-sm-2 col-form-label"
                            >
                                LastName
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${
                                        errors?.LastName ? "is-invalid" : ""
                                    }`}
                                    name="LastName"
                                    autoComplete="off"
                                    value={formData.LastName}
                                    onChange={handleChange}
                                />
                                <div className="invalid-feedback">
                                    {errors?.LastName}
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label
                                htmlFor="LastName"
                                className="col-sm-2 col-form-label"
                            >
                                PhoneNo.
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${
                                        errors?.PhoneNumber ? "is-invalid" : ""
                                    }`}
                                    name="PhoneNumber"
                                    autoComplete="off"
                                    value={formData.PhoneNumber}
                                    onChange={handleChange}
                                />
                                <div className="invalid-feedback">
                                    {errors?.PhoneNumber}
                                </div>
                            </div>
                        </div>
                        {Id === "0" && (
                            <div className="mb-3 row">
                                <label
                                    htmlFor="Password"
                                    className="col-sm-2 col-form-label"
                                >
                                    Password
                                </label>
                                <div className="col-sm-10">
                                    <input
                                        type="password"
                                        className={`form-control ${
                                            errors?.Password ? "is-invalid" : ""
                                        }`}
                                        name="Password"
                                        autoComplete="off"
                                        value={formData.Password}
                                        onChange={handleChange}
                                    />
                                    <div className="invalid-feedback">
                                        <ul className="mb-0">
                                            {errors?.Password?.map(
                                                (msg: string, i: number) => (
                                                    <li key={i}>{msg}</li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mb-3 row">
                            <label
                                htmlFor="description"
                                className="col-sm-2 col-form-label"
                            >
                                Role
                            </label>
                            <div className="col-sm-10">
                                {rolesData.map((item, index) => (
                                    <div className="form-check" key={index}>
                                        <input
                                            key={index}
                                            className="form-check-input"
                                            type="checkbox"
                                            id={"check_" + index}
                                            value={item.name}
                                            name="roles[]"
                                            checked={item.checked}
                                            onChange={updateCheckStatus}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor={"check_" + index}
                                        >
                                            {item.name}
                                        </label>
                                    </div>
                                ))}
                                {rolesData.length < 1 && "No record found"}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {submitLoading && (
                            <div>
                                <small>
                                    <strong>Loading..</strong>
                                </small>
                                <div
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                            </div>
                        )}
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                            onClick={handleModalClose}
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitLoading}
                        >
                            Submit
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    );
};

export default Users;
