export function sign(sessionCredentials: string[], logState: boolean): string {
    if (logState) {
        console.log('sign in');
        return ""
    }
    console.log('sign up');
    return "0123"
}