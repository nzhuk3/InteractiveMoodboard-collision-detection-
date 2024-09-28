

interface MovableProps {
    children: React.ReactNode,
    isDragged?: boolean
}

function Movable(props: MovableProps) {

    return (
        <div className='movable' style={{
            width: 'fit-content',
            height: 'fit-content',
            position: 'relative',
            transition: props.isDragged ? 'none' : '1s',
        }}>
            {props.children}
        </div>
    );
}

export default Movable