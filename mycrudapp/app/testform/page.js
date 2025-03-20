// 'use client'
// import { useEffect, useState } from 'react';

// export default function FormPage() {
//     const userData = {
//         "username": "asdf",
//         "age": "20",
//         "gender": "male",
//         "terms": true
//     };

//     const [formData, setFormData] = useState({
//         username: '',
//         age: '',
//         gender: '',
//         terms: false
//     });
//     const userId = "xyz";

//     useEffect(()=>{
//         if (userId){
//     console.log("userData===>>>",userData)

//             // setFormData(userData)
//         }
//     }, [userId])



//     const handleChange = (e) => {
//         console.log("e.target", e.target, e.target.name, e.target.value,  e.target.type, e.target.checked)
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log('Form Data Submitted:', formData);
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <div>
//                 <label htmlFor="username">Username:</label>
//                 <input
//                     type="text"
//                     id="username"
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                 />
//             </div>
//             <div>
//                 <label htmlFor="age">Age:</label>
//                 <select id="age" name="age" value={formData.age} onChange={handleChange}>
//                     <option value="">Select your age</option>
//                     <option value="20">20</option>
//                     <option value="30">30</option>
//                 </select>
//             </div>
//             <div>
//                 <label>Gender:</label>
//                 <label htmlFor="male">Male</label>
//                 <input
//                     type="radio"
//                     id="male"
//                     name="gender"
//                     value="male"
//                     checked={formData.gender === 'male'}
//                     onChange={handleChange}
//                 />
//                 <label htmlFor="female">Female</label>
//                 <input
//                     type="radio"
//                     id="female"
//                     name="gender"
//                     value="female"
//                     checked={formData.gender === 'female'}
//                     onChange={handleChange}
//                 />
//             </div>
//             <div>
//                 <label htmlFor="terms">Accept Terms:</label>
//                 <input
//                     type="checkbox"
//                     id="terms"
//                     name="terms"
//                     checked={formData.terms}
//                     onChange={handleChange}
//                 />
//             </div>
//             <button type="submit">Submit</button>
//         </form>
//     );
// }


'use client'
import { useState } from 'react';

export default function FormPage() {
    const [formData, setFormData] = useState({
        username: '',
        interests: [] // Array to store multiple checkbox values
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => {
                const currentValues = prev[name];
                if (checked) {
                    // Add the value to the array
                    return { ...prev, [name]: [...currentValues, value] };
                } else {
                    // Remove the value from the array
                    return { ...prev, [name]: currentValues.filter(item => item !== value) };
                }
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data Submitted:', formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                />
            </div>
            <fieldset>
                <legend>Interests:</legend>
                <label htmlFor="sports">
                    <input
                        type="checkbox"
                        id="sports"
                        name="interests"
                        value="sports"
                        checked={formData.interests.includes('sports')}
                        onChange={handleChange}
                    />
                    Sports
                </label>
                <label htmlFor="music">
                    <input
                        type="checkbox"
                        id="music"
                        name="interests"
                        value="music"
                        checked={formData.interests.includes('music')}
                        onChange={handleChange}
                    />
                    Music
                </label>
                <label htmlFor="games">
                    <input
                        type="checkbox"
                        id="games"
                        name="interests"
                        value="games"
                        checked={formData.interests.includes('games')}
                        onChange={handleChange}
                    />
                    Games
                </label>
            </fieldset>
            <button type="submit">Submit</button>
        </form>
    );
}
