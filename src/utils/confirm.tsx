import { createRoot } from "react-dom/client";
import { Modal, Button } from "react-bootstrap";

export function confirm({
    title = "Confirm",
    message = "Are you sure?",
}: {
    title?: string;
    message?: string;
}): Promise<boolean> {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const root = createRoot(div);

    return new Promise<boolean>((resolve) => {
        const handleClose = (result: boolean) => {
            resolve(result);
            setTimeout(() => {
                root.unmount();
                div.remove();
            }, 100); // give time for modal close animation
        };

        root.render(
            <Modal
                show
                onHide={() => handleClose(false)}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{message}</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => handleClose(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => handleClose(true)}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    });
}
