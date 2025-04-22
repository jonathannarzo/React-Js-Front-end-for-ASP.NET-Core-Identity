import axios from "../../api/axios";
import { toast } from "react-toastify";
import { useEffect, useState, useMemo } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";

const Profile = () => {
    const profileUrl = "Account/profile";
    const updateProfileUrl = "Account/profile/update";
    const axiosPrivate = useAxiosPrivate();
    const { auth }: any = useAuth();

    // Id which is the primary key of the user
    const [Id, setId] = useState<string>("0");

    // form datas to be used in the user info
    const [formData, setformData] = useState({
        Id: "0",
        FirstName: "",
        LastName: "",
        Email: "",
        PhoneNumber: "",
    });

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        getProfileData();
    }, []);

    // method to get all users
    const getProfileData = async () => {
        console.log(auth);
        try {
            const response = await axiosPrivate.get(profileUrl);
            const data = response.data;
            setId(data.id);
            setformData({
                Id: data.id ?? "",
                FirstName: data.firstName ?? "",
                LastName: data.lastName ?? "",
                Email: data.email ?? "",
                PhoneNumber: data.phoneNumber ?? "",
            });
        } catch (error) {
            console.log(error);
        }
    };

    // method to handle form inputs on change
    const handleChange = (e: { target: { name: any; value: any } }) =>
        setformData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));

    // method to update a category
    const handleUpdate = (formData: {
        Id: string;
        FirstName: string;
        LastName: string;
        Email: string;
        PhoneNumber: string;
    }) => {
        axiosPrivate
            .put(updateProfileUrl, formData)
            .then(function (response) {
                toast.success("Profile successfully updated!");
                setErrors({});
                return true;
            })
            .catch(function (error) {
                setErrors(error.response.data);
                return false;
            });
    };

    // handles the update and create of category
    const handleSubmit = (e: { preventDefault: () => void; target: any }) => {
        e.preventDefault();

        if (Id !== "0") {
            // if id not zero update the existing record
            formData.Id = Id;
            console.log(formData);

            handleUpdate(formData);
        } else {
            // create new record if id is not assigned
            console.log("Failed to update");
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">Profile</h1>
            </div>

            <div className="my-3 p-3 bg-body rounded shadow-sm">
                <form
                    onSubmit={handleSubmit}
                    id="profileForm"
                    className="needs-validation"
                >
                    <div className="row g-3">
                        <div className="col-sm-6">
                            <label htmlFor="firstName" className="form-label">
                                First name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                name="FirstName"
                                placeholder=""
                                value={formData.FirstName}
                                required
                                onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                                Valid first name is required.
                            </div>
                        </div>

                        <div className="col-sm-6">
                            <label htmlFor="lastName" className="form-label">
                                Last name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                name="LastName"
                                placeholder=""
                                value={formData.LastName}
                                required
                                onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                                Valid last name is required.
                            </div>
                        </div>

                        <div className="col-sm-6">
                            <label htmlFor="phonenumber" className="form-label">
                                Email Address
                            </label>
                            <div className="input-group has-validation">
                                <input
                                    type="text"
                                    className={`form-control ${
                                        errors?.email ? "is-invalid" : ""
                                    }`}
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleChange}
                                />

                                <div className="invalid-feedback">
                                    {errors?.email}
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-6">
                            <label htmlFor="phonenumber" className="form-label">
                                Phone Number
                            </label>
                            <div className="input-group has-validation">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="PhoneNumber"
                                    value={formData.PhoneNumber}
                                    onChange={handleChange}
                                />
                                <div className="invalid-feedback">
                                    Your phonenumber is required.
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <button
                        className="w-100 btn btn-primary btn-lg"
                        type="submit"
                    >
                        Update Profile
                    </button>
                </form>
            </div>
        </>
    );
};

export default Profile;
