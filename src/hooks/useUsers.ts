import { fetchUsers } from "../services/users";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type User } from "../types";

export const useUsers = () => {
    const {isLoading, isError, data, refetch, fetchNextPage, hasNextPage} = useInfiniteQuery<{ nextCursor?: number; users: User[]}>({
        queryKey: ['users'],// <-- Es el nombre de la query, es un identificador único para la query. Se puede usar cualquier string o array como identificador.
        queryFn: fetchUsers,// <-- Como trae la información de la API
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false, // <-- Para que no se vuelva a hacer la petición cuand se vuelve a hacer foco en la ventana. Esto es útil para evitar que se hagan peticiones innecesarias cuando el usuario vuelve a la pestaña de la aplicación. Si se quiere que se vuelva a hacer la petición, se puede poner true.
        staleTime: 1000 * 3 // En este caso 3 segundos, es el tiempo que se considera fresco la data. Es decir, si la data no ha cambiado en este tiempo, no se vuelve a hacer la petición. Esto es útil para evitar que se hagan peticiones innecesarias cuando la data no ha cambiado. Si se quiere que se vuelva a hacer la petición, se puede poner 0 o false.
      }) 

    console.log("data --->", data)
    return {
        isLoading,
        isError,
        users: data?.pages.flatMap(page => page.users) ?? [], // <-- Esto es para aplanar el array de usuarios, ya que la API devuelve un array de arrays. Es decir, la API devuelve un array de páginas, y cada página tiene un array de usuarios. Entonces, usamos flatMap para aplanar el array de páginas y quedarnos solo con el array de usuarios. Si no hay usuarios, se queda como un array vacío.
        refetch,
        fetchNextPage,
        hasNextPage
    }
}

//* ?? [] Este es el operador de fusión nula (nullish coalescing). Si lo de la izquierda (data?.pages.flatMap(...)) es null o undefined, usá el valor de la derecha ([]). En este caso, garantiza que users siempre será un array, aunque la petición haya fallado o no se haya hecho aún.  

// Todo preguntarle Tardo por qué con esto no agarra en el app.tsx (data?.pages.flatMap(page => page.users) != null) || []  y con esto si: data?.pages.flatMap(page => page.users) ?? []