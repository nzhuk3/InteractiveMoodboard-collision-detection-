import { useState, useEffect, useRef, useCallback, SyntheticEvent} from "react"
import Movable from "./Movable"

type Coordinate = {
    x: number,
    y: number
}

interface MovableInitial {
    id: number;
    speed: number;
    children: React.ReactNode;
  }
  
  interface MovableExtended extends MovableInitial {
    rect: DOMRect;
    initialRect: DOMRect;
    pos: Coordinate;
    mouse: Coordinate;
    offset: Coordinate;
    element: HTMLDivElement | null;
  }
  
  interface MovableProps {
    movables: MovableInitial[];
  }
  
  function CollisionPane({ movables }: MovableProps) {
    const paneRef = useRef<HTMLDivElement>(null);
    const movablesRef = useRef<Partial<MovableExtended>[]>(movables); // Используем Partial для расширяемых свойств
    const movedElId = useRef<number>(-1);
    const requestRef = useRef<number | null>(null);
    const [isDragged, setIsDragging] = useState<boolean>(false);
    const [resetTrigger, resetPane] = useState(false);
    // const listeners = useRef<Movable[]>([]);

    useEffect(() => {
        movablesRef.current.forEach((movable, id) => {
            if (paneRef.current) {
                movable.element = paneRef.current.children[id] as HTMLDivElement;
                if (movable.element) {
                    movable.rect = movable.element.getBoundingClientRect();
                    movable.initialRect = movable.rect;
                    movable.pos = {x: 0, y: 0};
                    movable.offset = {x: 0, y: 0};
                    movable.mouse = {x: 0, y: 0};
                    movable.element.style.transform = `translate(${movable.pos.x}px, ${movable.pos.y}px)`;
                }
            }
        })
    }, [])

    useEffect(() => {
        movablesRef.current.forEach((movable, id) => {
            if (paneRef.current && paneRef.current.children[id]) {
                movable.element = paneRef.current.children[id] as HTMLDivElement;
                if (movable.element) {
                    movable.pos = {x: 0, y: 0};
                    movable.offset = {x: 0, y: 0};
                    movable.mouse = {x: 0, y: 0};
                    movable.element.style.transform = '';
                    movable.rect = movable.initialRect;
                }
            }
        })
    }, [resetTrigger])

    const handleMove = useCallback((e: MouseEvent) => {
        if (isDragged && movedElId.current >= 0) {
            const movable = movablesRef.current[movedElId.current];
            if (movable.offset && movable.initialRect) {
                movable.mouse = { 
                    x: e.clientX - movable.offset.x - movable.initialRect.left, 
                    y: e.pageY - movable.offset.y - movable.initialRect.top
                };
            }
        }
        // console.log('-------------------------------------');
        // console.log('Rect', rect.current?.left, rect.current?.top)
        // console.log('Event', e.clientX, e.pageY);
        // console.log('Mouse', mouse.current);
        // console.log('Offset', offset.current);
    }, [isDragged]);


    const handleDown = useCallback(({nativeEvent}: SyntheticEvent<HTMLDivElement, MouseEvent>) => {
        if (nativeEvent.target instanceof HTMLDivElement && nativeEvent.target.className === 'movable') {
            setIsDragging(true);
            movablesRef.current.forEach((movable, id) => {
                if (Object.is(nativeEvent.target, movable.element) && movable.element) {
                    // listeners.current = [];
                    // listeners.current.push(movable);
                    movedElId.current = id;
                    movable.rect = movable.element.getBoundingClientRect();
                    movable.offset = {x: nativeEvent.clientX - movable.rect.left, y: nativeEvent.clientY - movable.rect.top};
                    
                }
            })
        }
    }, []);

    const handleUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const resetHandler = useCallback(() => {
        resetPane(!resetTrigger);
    }, [resetTrigger])

    // function checkForCollision(movingRect: DOMRect, steadyRect: DOMRect): boolean {
    //     return movingRect.right - steadyRect.left >= -COLLISION_THRESHOLD 
    //         && movingRect.right - steadyRect.left <= (COLLISION_THRESHOLD + movingRect.width * 2) 
    //         && movingRect.bottom - steadyRect.top >= -COLLISION_THRESHOLD 
    //         && movingRect.bottom - steadyRect.top <= (COLLISION_THRESHOLD + movingRect.height * 2);
    // }

    /* function detectCollision(id) {
        for (let i = 0; i < movablesRef.current.length; i++) {
            const rect1 = movablesRef.current[movedElId.current].rect;
            const rect2 = movablesRef.current[i].rect;
            if (checkForCollision(rect1, rect2) && i != movedElId.current) {
                listeners.current = [];
                listeners.current.push(movablesRef.current[movedElId.current]);
                listeners.current.push(movablesRef.current[i]);
                const offset = getCollisionOffset(rect1, rect2);
                movablesRef.current[i].mouse.x += offset.x;
                movablesRef.current[i].mouse.y += offset.y;
            }
        }
    
    } */

    const animate = useCallback(() => {
        const movable = movablesRef.current[movedElId.current];
        // detectCollision(movedElId.current);
        /* listeners.forEach(listener => {
            if (listener.pos && listener.mouse && listener.speed) {
            listener.pos.x += (listener.mouse.x - listener.pos.x) * listener.speed;
            listener.pos.y += (listener.mouse.y - listener.pos.y) * listener.speed;

            if (listener.element) {
                listener.element.style.transform = `translate(${listener.pos.x}px, ${listener.pos.y}px)`;
            }
           }
        }) */
        if (movable.pos && movable.mouse && movable.speed) {
            movable.pos.x += (movable.mouse.x - movable.pos.x) * movable.speed;
            movable.pos.y += (movable.mouse.y - movable.pos.y) * movable.speed;

            if (movable.element) {
                movable.element.style.transform = `translate(${movable.pos.x}px, ${movable.pos.y}px)`;
            }
        }
        
        requestRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        
        if (isDragged) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
            requestRef.current = requestAnimationFrame(animate);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }            
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            
        }
    }, [isDragged, handleMove, handleUp, animate]);
    

  return (
    <>
    <button onClick={resetHandler} className="reset-button">Reset</button>
    <div ref={paneRef} onMouseDown={handleDown}>
        {movablesRef.current?.map((movable) => {
            return (
                <Movable key={movable.id} isDragged={isDragged}>
                    {movable.children}
                </Movable>
            )
        })}
    </div>
    </>
  )
}

export default CollisionPane




{/* <div className="panel">
        <span>Block</span><span> 2</span>
      </div> */}
// export default function Movable( {children, moveSpeed = 0.5, resetTrigger = false, collisionOffset = {x: 0, y: 0}, id, onPositionChange}: MovableProps) {
//     const element = useRef<HTMLDivElement | null>(null); 
//     const requestRef = useRef<number | null>(null);
//     const [isDragged, setIsDragging] = useState<boolean>(false);
//     const pos = useRef<{ x: number; y: number }>({x: 0, y: 0});
//     const offset = useRef<{ x: number; y: number }>({x: 0, y: 0});
//     const mouse = useRef<{ x: number; y: number }>({x: 0, y: 0});
//     const rect: MutableRefObject<DOMRect | undefined> = useRef(undefined);
//     const initialRect: MutableRefObject<DOMRect | undefined> = useRef(undefined);
//     const zIndex = useRef(0);

//     const handleMove = useCallback((e: MouseEvent) => {
       
//         if (isDragged && rect.current && initialRect.current) {
//             mouse.current = { 
//                 x: e.clientX - offset.current.x - initialRect.current.left, 
//                 y: e.pageY - offset.current.y - initialRect.current.top
//             };
//         }
//         // console.log('-------------------------------------');
//         // console.log('Rect', rect.current?.left, rect.current?.top)
//         // console.log('Event', e.clientX, e.pageY);
//         // console.log('Mouse', mouse.current);
//         // console.log('Offset', offset.current);
//     }, [isDragged]);

//     const handleUp = useCallback(() => {
//         setIsDragging(false);
//         zIndex.current = 0;
//     }, []);

//     const handleDown = useCallback(({nativeEvent}: SyntheticEvent<HTMLDivElement, MouseEvent>) => {
//         rect.current = element.current?.getBoundingClientRect();
//         if (element.current && rect.current) {
//             zIndex.current = 1;
//             offset.current = {x: nativeEvent.clientX - rect.current.left - collisionOffset.x, y: nativeEvent.clientY - rect.current.top - collisionOffset.y}
//         }
//         setIsDragging(true);
//     }, [collisionOffset.x, collisionOffset.y]);

//     const animate = useCallback(() => {
//         pos.current.x += (mouse.current.x - pos.current.x) * moveSpeed;
//         pos.current.y += (mouse.current.y - pos.current.y) * moveSpeed;

//         if (element.current) {
//             element.current.style.transform = getMatrix(1, 1, 0, pos.current.x, pos.current.y);
//             onPositionChange(id, element.current.getBoundingClientRect(), collisionOffset);
//         }

//         requestRef.current = requestAnimationFrame(animate);
//     }, [moveSpeed, id, onPositionChange]);

//     useEffect(() => {
//         if (element.current) {
//             rect.current = element.current.getBoundingClientRect();
//             initialRect.current = element.current.getBoundingClientRect();           
//         }    
//     }, []);

//     useEffect(() => {
//         if (element.current) {
//             // Применяем смещение только после столкновения
//             pos.current.x += collisionOffset.x;
//             pos.current.y += collisionOffset.y;
//             element.current.style.transform = getMatrix(1, 1, 0, pos.current.x, pos.current.y);
//         }
//     }, [collisionOffset]);

//     useEffect(() => {
//         if (element.current) {
//             pos.current = { x: 0, y: 0 };
//             mouse.current = { x: 0, y: 0 };
//             offset.current = { x: 0, y: 0 };
//             element.current.style.transform = '';
//             rect.current = initialRect.current;
//         }
//     }, [resetTrigger]);

//     useEffect(() => {
        
//         if (isDragged) {
//             window.addEventListener('mousemove', handleMove);
//             window.addEventListener('mouseup', handleUp);
//             requestRef.current = requestAnimationFrame(animate);
//         } else {
//             window.removeEventListener('mousemove', handleMove);
//             window.removeEventListener('mouseup', handleUp);
//             if (requestRef.current) {
//                 cancelAnimationFrame(requestRef.current);
//             }
//             if (element.current && rect.current) {
//                 rect.current = element.current.getBoundingClientRect();
//                 // console.log('Rect:', rect.current);
//                 // console.log('Pos', pos.current);
//                 // console.log('Mouse', mouse.current);
//                 // console.log('Offset', offset.current);
//             }
//         }

//         return () => {
//             window.removeEventListener('mousemove', handleMove);
//             window.removeEventListener('mouseup', handleUp);
//             if (requestRef.current) {
//                 cancelAnimationFrame(requestRef.current);
//             }
//         }
//     }, [isDragged, handleMove, handleUp, animate]);


//     return (
//         <div ref={element} onMouseDown={handleDown} style={{
//             cursor: isDragged ? 'grabbing' : 'grab',
//             width: 'fit-content',
//             height: 'fit-content',
//             position: 'relative',
//             transition: isDragged ? 'none' : '1s',
//             zIndex: zIndex.current,
//         }}>
//             {children}
//         </div>
//     );
// }