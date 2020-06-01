class Node {
    constructor(newName='', newNext=null, newPrev=null, newData) {
        this.name = newName;
        this.next = newNext;
        this.prev = newPrev;
        this.data = newData;
    }
    print() { console.log(`-- ${this.name}, with data: ${this.data} --`); }
    delete() {
        this.name = null;
        this.next = null;
        this.prev = null;
        this.data = null;

        delete this.name;
        delete this.next;
        delete this.prev;
        delete this.data;
    }
}

let privateProps = new WeakMap();

export default class CircularQueue {
    constructor(nameOfQueue) {
        privateProps.set(this, {
            head: null,
            tail: null,
            cur: null,
        }); // this is private

        this.name = nameOfQueue;
        this.numOfItems = 0;
    }

    // prototype functions
    insertData(data, name) {
        //console.log(`inserting data [${data}] into Queue ${this.name}`);
        let pvt = privateProps.get(this);
        if (pvt.head === null) {
            pvt.head = new Node(name, null, null, data);
            pvt.head.prev = pvt.head.next = pvt.cur = pvt.tail = pvt.head;
        } else {
            pvt.tail = new Node(name, pvt.head, pvt.tail, data);
            pvt.tail.prev.next = pvt.tail;
            pvt.head.prev = pvt.tail;
        }
        this.numOfItems++;
    }

    removeData(data) {
        let node = this.getData(data);
        if (node) {
            let pvt = privateProps.get(this);
            node.prev.next = node.next;
            node.next.prev = node.prev;
            if (node == pvt.head) {
                pvt.head = node.next;
            } else if (node == pvt.tail) {
                pvt.tail = node.next
            } else if (node == pvt.cur) {
                pvt.cur = node.next;
            }
            node.delete();
            this.numOfItems--;
        } else {
            console.log(`${data} not found in Queue ${this.name}`);
        }
    }

    getData(data) {
        if (this.numOfItems > 0) {
            let pvt = privateProps.get(this);
            let temp = pvt.head;
            while (temp != pvt.tail) {
                if (temp.data === data) { return temp; }
                temp = temp.next;
            }
            return (temp.data === data) ? temp : null;
        }
        return null;
    }

    getCur() {
        let pvt = privateProps.get(this);
        return pvt.cur;
    }

    setCur(name) {
        if (this.numOfItems > 0) {
            let pvt = privateProps.get(this);
            let temp = pvt.head;
            while (temp != pvt.tail) {
                if (temp.name === name) { 
                    pvt.cur = temp;
                    return temp; 
                }
                temp = temp.next;
            }
            if (temp.name === name) {
                pvt.cur = temp;
                return temp; 
            }
            return null;
        }
        return null;
    }

    moveNext(callback) {
        let pvt = privateProps.get(this);
        let from = pvt.cur;
        let to = pvt.cur.next;
        pvt.cur = pvt.cur.next;
        callback(from, to);
    }

    movePrev(callback) {
        let pvt = privateProps.get(this);
        let from = pvt.cur;
        let to = pvt.cur.prev;
        pvt.cur = pvt.cur.prev;
        callback(from, to);
    }

    print() {
        console.log(`There are ${this.numOfItems} items in Queue ${this.name}`);
        if (this.numOfItems > 0) {
            let pvt = privateProps.get(this);
            let temp = pvt.head;
            while (temp != pvt.tail) {
                temp.print();
                temp = temp.next;
            }
            temp.print();
        }
    }

    length() {

    }
    
    iterate(callback) {
        let index = 0;
        if (this.numOfItems > 0) {
            let pvt = privateProps.get(this);
            let temp = pvt.head;
            while (temp != pvt.tail) {
                callback(temp, index++); // give data
                temp = temp.next; // move next
            }
            callback(temp, index++);
        }
    }
}
