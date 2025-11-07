import './App.css'

export default function Introduction() {
    return (
        <>
            <h1 className="centered">Introduction</h1>
            <img
                className="intro-img"
                style={{ maxWidth: 'fit-content', maxHeight: 'fit-content' }}
                src="/mexico_trip.jpg"
                alt="Picture of Grimble Curiel"
            />
            <p className="centered">San Juan Teotihuacán, State of Mexico, Mexico</p>
            <p className="centered"> Howdy my name’s Grimble, my major is Information Technology. I switched to this major cause
                UNCC wants calculus 1 and 2
                to make games for
                some reason. I like cooking, games both physical and digital, adrenaline chasing and hikes (contrary to my
                appearance).</p>
            <p>
                <strong>Personal Background:</strong> Born in Charlotte but been around.<br />
                <strong>Professional Background:</strong> Regularly perform technological and software repair. I’ve done an
                Internship with NC Tech
                Partners. Nearly done with college.<br />
                <strong>Academic Background:</strong> Information Technology senior<br />
                <strong>Primary Computer:</strong> Alienware, Windows, Desktop, Home
            </p>
            <p>
                <strong>Courses I’m Taking, &amp; Why:</strong><br />
                JAPN 3201 - Upper Intermediate Japanese I: Want to learn Japanese<br />
                ITIS 3135 - Front-End Web App Dev: Required<br />
                ITCS 3160 - Intro to Databases: Required<br />
                ITIS 3130 - Human Centered Computing: Required
            </p>
            <p>
                <strong>Funny/Interesting Item to Remember Me by:</strong> Rotund<br />
            </p>
            <p className="centered">
                “Time is a waste of life, life is a waste of time, if you’re wasted all the time you’ll have the time of
                your life!” ~ Billy Connolly
            </p>
        </>
    );
}
