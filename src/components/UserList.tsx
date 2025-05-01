import { SortBy, type User } from "../types";////a

interface Props {
    users: User[],
    showColorRows: boolean,
    deleteUser: (email: string) => void,
    changeSorting: (sort: SortBy) => void
}

//No se usa React.FC porque no se va a usar el children, es mejor no usarlo para evitar confusiones
//* Pero principalmente porque esto es pensado para una prueba técnica y hay que ahorrar tiempo
export const UserList = ({ users, showColorRows, deleteUser, changeSorting }: Props) => {

    return (
        <table width="100%">
            <thead>
                <tr>
                    <th>Foto</th>
                    <th className="pointer" onClick={() => changeSorting(SortBy.NAME)}>Nombre</th>
                    <th className="pointer" onClick={() => changeSorting(SortBy.LAST_NAME)}>Apellido</th>                    
                    <th className="pointer" onClick={() => changeSorting(SortBy.COUNTRY)}>País</th>
                    <th>Acciones</th>                    
                </tr>                
            </thead>

            <tbody className={showColorRows ? "table-colors": "table-no-colors"}>
                {
                    users.map( (user, index) => {
                        
                        /* const backgroundColor = index %2 === 0 ? "#333" : "#555"
                        const color = showColorRows ? backgroundColor : "transparent" */

                        //console.log(color)
                        //Es mejor usar el user.email como key, ya que es único y no se repite, el index puede cambiar si se eliminan o agregan usuarios
                        return(
                            <tr key={`${user.email}-${index}`} /* style={{ backgroundColor: color }} */>
                                <td>
                                    <img src={user.picture?.thumbnail} alt="Foto" />
                                </td>
                                <td>
                                    {user.name?.first}
                                </td>
                                <td>
                                    {user.name?.last}
                                </td>
                                <td>
                                    {user.location?.country}
                                </td>
                                <td>
                                    <button>Editar</button>
                                    <button onClick={ () => {deleteUser(user.email)}}>Eliminar</button>
                                </td>
                            </tr>
                        )

                    })
                }
            </tbody>
        </table>
    )
}

/*
    table, thead, tbody
    tr -> row, th -> celdas del header (vienen siendo las columnas), td -> celdas del body (sin pronlemas td se puede usar en el header)
*/