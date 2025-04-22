import axios from "../../api/axios";
import { toast } from "react-toastify";
import { useEffect, useState, useMemo } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";

const ChangePassword = () => {
    const changePassUrl = "Account/profile/changepassword";
    const axiosPrivate = useAxiosPrivate();
    const { auth }: any = useAuth();

    // Id which is the primary key of the user
    const [Id, setId] = useState<string>("0");

    // form datas to be used in the user password
    const [formData, setformData] = useState({
        CurrentPassword: "",
        NewPassword: "",
        ReTypeNewPass: "",
    });

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {}, []);

    // method to handle form inputs on change
    const handleChange = (e: { target: { name: any; value: any } }) =>
        setformData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));

    // method to update a category
    const handleUpdate = (formData: {
        CurrentPassword: string;
        NewPassword: string;
    }) => {
        axiosPrivate
            .put(changePassUrl, formData)
            .then(function (response) {
                toast.success("Password successfully changed!");
                // Clear errors
                setErrors({});
                return true;
            })
            .catch(function (error) {
                // Check for backend validation errors
                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.errors
                ) {
                    const apiErrors = error.response.data.errors;

                    const errorMap: { [key: string]: string[] } = {}; // Changed to array of strings

                    apiErrors.forEach(
                        (err: { code: string; description: string }) => {
                            if (err.code === "PasswordMismatch") {
                                errorMap.CurrentPassword = [err.description]; // Single error for CurrentPassword
                            } else {
                                // Collect all errors for NewPassword
                                if (!errorMap.NewPassword) {
                                    errorMap.NewPassword = [];
                                }
                                errorMap.NewPassword.push(err.description);
                            }
                        }
                    );

                    // Merge API errors with existing form validation errors
                    setErrors((prevErrors: any) => ({
                        ...prevErrors,
                        ...errorMap,
                    }));
                } else {
                    setErrors({
                        General: ["Something went wrong. Please try again."],
                    });
                }
                return false;
            });
    };

    // handles the update and create of category
    const handleSubmit = (e: { preventDefault: () => void; target: any }) => {
        e.preventDefault();

        // Clear errors
        setErrors({});

        const validationErrors: { [key: string]: string[] } = {};

        if (!formData.NewPassword) {
            validationErrors.NewPassword = ["New password is required."];
            // Merge form validation errors with API errors
            setErrors((prevErrors: any) => ({
                ...prevErrors,
                ...validationErrors,
            }));
            return false;
        }

        if (formData.ReTypeNewPass !== formData.NewPassword) {
            validationErrors.ReTypeNewPass = ["Passwords do not match."];
            // Merge form validation errors with API errors
            setErrors((prevErrors: any) => ({
                ...prevErrors,
                ...validationErrors,
            }));
            return false;
        }

        handleUpdate(formData);
    };

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">Change Password</h1>
            </div>

            <div className="my-3 p-3 bg-body rounded shadow-sm">
                {errors?.General && errors.General.length > 0 && (
                    <div className="col-sm-12">
                        <div className="alert alert-danger">
                            {errors.General.map(
                                (err: string, index: number) => (
                                    <div key={index}>{err}</div>
                                )
                            )}
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    id="changePasswordForm"
                    className="needs-validation"
                >
                    <div className="row mb-3">
                        <div className="col-sm-6">
                            <label htmlFor="firstName" className="form-label">
                                Curent Password
                            </label>
                            <input
                                type="text"
                                className={`form-control ${
                                    errors?.CurrentPassword ? "is-invalid" : ""
                                }`}
                                name="CurrentPassword"
                                placeholder=""
                                value={formData.CurrentPassword}
                                required
                                onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                                {errors?.CurrentPassword &&
                                    errors.CurrentPassword.map(
                                        (err: string, index: number) => (
                                            <div key={index}>{err}</div>
                                        )
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-sm-6">
                            <label htmlFor="lastName" className="form-label">
                                New Password
                            </label>
                            <input
                                type="text"
                                className={`form-control ${
                                    errors?.NewPassword ? "is-invalid" : ""
                                }`}
                                name="NewPassword"
                                placeholder=""
                                value={formData.NewPassword}
                                required
                                onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                                {errors?.NewPassword &&
                                    errors.NewPassword.map(
                                        (err: string, index: number) => (
                                            <div key={index}>{err}</div>
                                        )
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-sm-6">
                            <label htmlFor="phonenumber" className="form-label">
                                Retype New Password
                            </label>
                            <div className="input-group has-validation">
                                <input
                                    type="text"
                                    className={`form-control ${
                                        errors?.ReTypeNewPass
                                            ? "is-invalid"
                                            : ""
                                    }`}
                                    name="ReTypeNewPass"
                                    value={formData.ReTypeNewPass}
                                    onChange={handleChange}
                                />

                                <div className="invalid-feedback">
                                    {errors?.ReTypeNewPass &&
                                        errors.ReTypeNewPass.map(
                                            (err: string, index: number) => (
                                                <div key={index}>{err}</div>
                                            )
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <button
                        className="w-100 btn btn-primary btn-lg"
                        type="submit"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChangePassword;
