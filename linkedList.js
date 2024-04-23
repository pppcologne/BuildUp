class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
    
    moveNodeDown() {
        if (this.next === null) {
            return;
        }
        let temp = this.data;
        this.data = this.next.data;
        this.next.data = temp;
    }

    moveNodeUp() {
        if (this.prev === null) {
            return;
        }
        let temp = this.data;
        this.data = this.prev.data;
        this.prev.data = temp;
    }

}

class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    append(data) {
        const newNode = new Node(data);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
    }

    prepend(data) {
        const newNode = new Node(data);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.prev = newNode;
            newNode.next = this.head;
            this.head = newNode;
        }
    }

    delete(data) {
        if (!this.head) {
            return;
        }

        if (this.head.data === data) {
            this.head = this.head.next;
            this.head.prev = null;
            if (!this.head) {
                this.tail = null;
            }
            return;
        }

        let currentNode = this.head;
        while (currentNode.next) {
            if (currentNode.next.data === data) {
                currentNode.next = currentNode.next.next;
                currentNode.next.prev = currentNode;
                if (!currentNode.next) {
                    this.tail = currentNode;
                }
                return;
            }
            currentNode = currentNode.next;
        }
    }

    toArray() {
        let currentNode = this.head;
        const values = [];
        while (currentNode) {
            values.push(currentNode.data);
            currentNode = currentNode.next;
        }
        return values;
    }

}

module.exports = LinkedList;