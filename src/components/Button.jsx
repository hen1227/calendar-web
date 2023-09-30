

const Button = ({ title, onClick, style, color, borderColor }) => {

    const buttonStyles = {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 30,
        paddingRight: 30,
        borderRadius: 10,
        margin: 10,
        fontSize: 20,
        width: '80%',
        textAlign: "center",
        backgroundColor: color || '#10888830',
        borderColor: borderColor || '#108888CC',
        color: '#ffffff',
        borderStyle: "solid",
        borderWidth: 2,
    }

    return (
        <button onClick={onClick} style={{...buttonStyles, ...style}}>
            {title}
        </button>
    );
}

export default Button;
