export class UserLocationStateHandler {
    private static userLocation: string | null = null;
    //  constructor() {}

    public static setUserLocation(location: string): void {
        this.userLocation = location;
    }

    public static getUserLocation(): string | null {
        return this.userLocation;
    }

    public static clearUserLocation(): void {
        this.userLocation = null;
    }
}
