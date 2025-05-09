// Los 3 primeros tipos los hice yo, el resto los generó el generador de tipos de TypeScript a partir del JSON que devuelve la API

/* declare global {
    interface Array<T> {
        toSorted: (compareFn?: (a: T, b: T) => number) => T[];
    }
} */

//* Puedo utilizar estos tipo de dato para la paginación, si quiero. Este primer tipo UserPage lo devuelve la API. Cada "página" individual (UserPage) sí viene de la API (users: User[], nextCursor).
export interface UserPage{
    users: User[];
    nextCursor?: number;
}

//* Este segundo tipo es el que utilizo para la paginación infinita (por reactQuery). El envoltorio con pages y pageParams es propio de React Query para controlar la paginación.
export interface InfiniteUserData {
    pages: UserPage[];
    pageParams: number[];
}

export enum SortBy {
    NONE = 'none',
    NAME = 'name',
    LAST_NAME = 'last_name',    
    COUNTRY = 'country'
}

export interface APIResults {
    results: User[];
    info:    Info;
}

export interface Info {
    seed:    string;
    results: number;
    page:    number;
    version: string;
}

export interface User {
    gender:     string;
    name:       Name;
    location:   Location;
    email:      string;
    login:      Login;
    dob:        Dob;
    registered: Dob;
    phone:      string;
    cell:       string;
    id:         ID;
    picture:    Picture;
    nat:        string;
}

export interface Dob {
    date: Date;
    age:  number;
}

export interface ID {
    name:  string;
    value: string;
}

export interface Location {
    street:      Street;
    city:        string;
    state:       string;
    country:     string;
    postcode:    number;
    coordinates: Coordinates;
    timezone:    Timezone;
}

export interface Coordinates {
    latitude:  string;
    longitude: string;
}

export interface Street {
    number: number;
    name:   string;
}

export interface Timezone {
    offset:      string;
    description: string;
}

export interface Login {
    uuid:     string;
    username: string;
    password: string;
    salt:     string;
    md5:      string;
    sha1:     string;
    sha256:   string;
}

export interface Name {
    title: string;
    first: string;
    last:  string;
}

export interface Picture {
    large:     string;
    medium:    string;
    thumbnail: string;
}


