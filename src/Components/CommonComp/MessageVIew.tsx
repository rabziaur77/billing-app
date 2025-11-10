import React from "react";

const MessageView: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="alert alert-info" role="alert">
            {message}
        </div>
    );
}

export default MessageView;
