export default function CommanderModal() {

    function toKebabCase(commander_name) {
        return commander_name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // remove commas, apostrophes, etc.
            .trim()
            .replace(/\s+/g, '-'); // replace spaces with hyphens
    }

    function createLinks(commander_name) {
        const kebabName = toKebabCase(commander_name);
        
    }

    return (
        <>
            <img
                src={commander.image}
                alt={commander.commander_name}
            />
            <link></link>
        </>
    );
}